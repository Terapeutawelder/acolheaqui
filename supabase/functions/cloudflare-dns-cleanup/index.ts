import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CleanupRequest {
  domainId: string;
}

const TARGET_IP = "185.158.133.1";

// TLDs públicos com múltiplos níveis (ex: ".com.br").
const MULTI_PART_PUBLIC_SUFFIXES = new Set(["com.br", "net.br", "org.br", "gov.br", "edu.br"]);

function getRootDomain(domain: string): string {
  const parts = domain.split(".").filter(Boolean);
  if (parts.length <= 2) return domain;

  const last2 = parts.slice(-2).join(".");
  if (MULTI_PART_PUBLIC_SUFFIXES.has(last2) && parts.length >= 3) {
    return parts.slice(-3).join(".");
  }

  return last2;
}

async function cfRequest<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const cleaned = token.replace(/[^\x20-\x7E]/g, "").trim();
  const safeToken = cleaned.replace(/^Bearer\s+/i, "").replace(/\s+/g, "");
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${safeToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = await res.json();
  if (!res.ok || data?.success === false) {
    const msg = data?.errors?.[0]?.message ?? `Cloudflare request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

async function getZoneId(zoneName: string, token: string): Promise<string | null> {
  try {
    type ZonesResp = { success: boolean; result: Array<{ id: string; name: string }> };
    const url = `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(zoneName)}`;
    const data = await cfRequest<ZonesResp>(url, token);
    const zone = data.result?.[0];
    return zone?.id || null;
  } catch (error) {
    console.log(`[cloudflare-dns-cleanup] Could not find zone for ${zoneName}:`, error);
    return null;
  }
}

async function deleteRecordByNameAndType(
  zoneId: string,
  token: string,
  recordName: string,
  recordType: string
): Promise<boolean> {
  try {
    type ListResp = { success: boolean; result: Array<{ id: string; type: string; name: string; content: string }> };
    const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=${recordType}&name=${encodeURIComponent(recordName)}`;
    const list = await cfRequest<ListResp>(listUrl, token);

    if (!list.result || list.result.length === 0) {
      console.log(`[cloudflare-dns-cleanup] No ${recordType} record found for ${recordName}`);
      return true; // Already deleted or doesn't exist
    }

    // Delete all matching records
    for (const record of list.result) {
      console.log(`[cloudflare-dns-cleanup] Deleting ${recordType} record: ${record.name} -> ${record.content}`);
      await cfRequest(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`,
        token,
        { method: "DELETE" }
      );
    }

    return true;
  } catch (error) {
    console.error(`[cloudflare-dns-cleanup] Error deleting ${recordType} record for ${recordName}:`, error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const systemCloudflareToken = Deno.env.get("CLOUDFLARE_API_TOKEN");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { domainId } = (await req.json()) as CleanupRequest;
    if (!domainId) {
      return new Response(JSON.stringify({ success: false, message: "domainId é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get domain info before it's deleted
    const { data: domain, error } = await supabase
      .from("custom_domains")
      .select("id, domain, verification_token, cloudflare_zone_id, cloudflare_api_token")
      .eq("id", domainId)
      .single();

    if (error || !domain) {
      console.log("[cloudflare-dns-cleanup] Domain not found in database:", domainId);
      return new Response(
        JSON.stringify({ success: true, message: "Domínio não encontrado no banco de dados" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try both tokens: user's stored token AND system token
    const userToken = domain.cloudflare_api_token;
    const tokensToTry = [userToken, systemCloudflareToken].filter(Boolean) as string[];
    
    if (tokensToTry.length === 0) {
      console.log("[cloudflare-dns-cleanup] No Cloudflare API tokens available, skipping DNS cleanup");
      return new Response(
        JSON.stringify({ success: true, message: "Nenhum token Cloudflare disponível - cleanup ignorado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[cloudflare-dns-cleanup] Will try ${tokensToTry.length} token(s) for cleanup`);

    const rootDomain = getRootDomain(domain.domain);
    console.log(`[cloudflare-dns-cleanup] Cleaning up DNS for domain: ${domain.domain}, root: ${rootDomain}`);

    const results: { record: string; deleted: boolean }[] = [];
    let cleanupSuccess = false;

    // Try each token until one works
    for (const token of tokensToTry) {
      try {
        console.log(`[cloudflare-dns-cleanup] Trying token...`);
        
        // Try to get zone ID - first from stored value, then by lookup
        let zoneId = domain.cloudflare_zone_id;
        if (!zoneId) {
          zoneId = await getZoneId(rootDomain, token);
        }

        if (!zoneId) {
          console.log(`[cloudflare-dns-cleanup] Could not find zone with this token, trying next...`);
          continue;
        }

        console.log(`[cloudflare-dns-cleanup] Found zone ID: ${zoneId}`);

        // Delete TXT verification record
        const txtName = `_acolheaqui.${rootDomain}`;
        const txtDeleted = await deleteRecordByNameAndType(zoneId, token, txtName, "TXT");
        results.push({ record: `TXT ${txtName}`, deleted: txtDeleted });

        // Delete A record for root domain (only if it points to our IP)
        try {
          type ListResp = { success: boolean; result: Array<{ id: string; type: string; name: string; content: string }> };
          const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${encodeURIComponent(rootDomain)}`;
          const list = await cfRequest<ListResp>(listUrl, token);

          for (const record of list.result || []) {
            if (record.content === TARGET_IP) {
              console.log(`[cloudflare-dns-cleanup] Deleting A record: ${record.name} -> ${record.content}`);
              await cfRequest(
                `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`,
                token,
                { method: "DELETE" }
              );
              results.push({ record: `A ${rootDomain}`, deleted: true });
            }
          }
        } catch (error) {
          console.error(`[cloudflare-dns-cleanup] Error checking/deleting A record for ${rootDomain}:`, error);
        }

        // Delete A record for www subdomain (only if it points to our IP)
        try {
          const wwwDomain = `www.${rootDomain}`;
          type ListResp = { success: boolean; result: Array<{ id: string; type: string; name: string; content: string }> };
          const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${encodeURIComponent(wwwDomain)}`;
          const list = await cfRequest<ListResp>(listUrl, token);

          for (const record of list.result || []) {
            if (record.content === TARGET_IP) {
              console.log(`[cloudflare-dns-cleanup] Deleting A record: ${record.name} -> ${record.content}`);
              await cfRequest(
                `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`,
                token,
                { method: "DELETE" }
              );
              results.push({ record: `A ${wwwDomain}`, deleted: true });
            }
          }
        } catch (error) {
          console.error(`[cloudflare-dns-cleanup] Error checking/deleting A record for www.${rootDomain}:`, error);
        }

        cleanupSuccess = true;
        break; // Success with this token, no need to try others
        
      } catch (tokenError) {
        console.log(`[cloudflare-dns-cleanup] Token failed, trying next...`, tokenError);
        continue;
      }
    }

    if (!cleanupSuccess) {
      console.log(`[cloudflare-dns-cleanup] Could not cleanup with any token - zone may not be accessible`);
      return new Response(
        JSON.stringify({ success: true, message: "Não foi possível limpar DNS - zona pode não estar acessível" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[cloudflare-dns-cleanup] Cleanup results:`, results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Registros DNS removidos do Cloudflare",
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("[cloudflare-dns-cleanup] Error:", errorMessage);
    return new Response(JSON.stringify({ success: false, message: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
