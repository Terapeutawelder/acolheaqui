import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SetupRequest {
  domainId: string;
  cloudflareApiToken: string;
}

const TARGET_IP = "185.158.133.1";

// TLDs públicos com múltiplos níveis (ex: ".com.br").
// Sem isso, "exemplo.com.br" viraria "com.br" e quebraria a automação.
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
  // Very thorough sanitization of the token
  // Remove all non-printable ASCII chars, trim whitespace, handle "Bearer " prefix
  const cleaned = token
    .replace(/[^\x20-\x7E]/g, "") // Remove non-printable chars
    .trim()
    .replace(/^Bearer\s+/i, "") // Remove Bearer prefix
    .replace(/\s+/g, ""); // Remove all internal whitespace
  
  console.log(`[cfRequest] Token length: original=${token.length}, cleaned=${cleaned.length}`);
  console.log(`[cfRequest] Token starts with: ${cleaned.substring(0, 10)}...`);
  console.log(`[cfRequest] Calling URL: ${url}`);
  
  const headers = {
    "Authorization": `Bearer ${cleaned}`,
    "Content-Type": "application/json",
    ...(init?.headers ?? {}),
  };
  
  const res = await fetch(url, {
    ...init,
    headers,
  });

  const text = await res.text();
  console.log(`[cfRequest] Response status: ${res.status}`);
  
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    console.error(`[cfRequest] Non-JSON response: ${text.substring(0, 200)}`);
    throw new Error(`Cloudflare returned non-JSON response: ${res.status}`);
  }
  
  if (!res.ok || data?.success === false) {
    const msg = data?.errors?.[0]?.message ?? `Cloudflare request failed (${res.status})`;
    console.error(`[cfRequest] Cloudflare error: ${msg}`, JSON.stringify(data?.errors));
    throw new Error(msg);
  }
  return data as T;
}

async function getZoneId(zoneName: string, token: string): Promise<string> {
  type ZonesResp = { success: boolean; result: Array<{ id: string; name: string }> };
  const url = `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(zoneName)}`;
  const data = await cfRequest<ZonesResp>(url, token);
  const zone = data.result?.[0];
  if (!zone?.id) throw new Error("Zona não encontrada no Cloudflare para este domínio");
  return zone.id;
}

async function upsertRecord(zoneId: string, token: string, record: { type: string; name: string; content: string }) {
  type ListResp = { success: boolean; result: Array<{ id: string; type: string; name: string; proxied?: boolean }> };
  const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=${record.type}&name=${encodeURIComponent(record.name)}`;
  const list = await cfRequest<ListResp>(listUrl, token);
  const existing = list.result?.[0];

  const payload = {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: 3600,
    proxied: false, // Always disable proxy for our domains
  };

  if (existing?.id) {
    // Log if we're disabling proxy
    if (existing.proxied) {
      console.log(`[cloudflare-dns-setup] Disabling proxy for ${record.name} (was proxied)`);
    }
    await cfRequest(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existing.id}`,
      token,
      { method: "PUT", body: JSON.stringify(payload) }
    );
    console.log(`[cloudflare-dns-setup] Updated record ${record.type} ${record.name} -> ${record.content} (proxied: false)`);
    return;
  }

  await cfRequest(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    token,
    { method: "POST", body: JSON.stringify(payload) }
  );
  console.log(`[cloudflare-dns-setup] Created record ${record.type} ${record.name} -> ${record.content} (proxied: false)`);
}

// Function to disable proxy on existing records (called during verification)
async function disableProxyIfNeeded(zoneId: string, token: string, recordName: string): Promise<boolean> {
  type ListResp = { success: boolean; result: Array<{ id: string; type: string; name: string; content: string; proxied?: boolean }> };
  const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${encodeURIComponent(recordName)}`;
  
  try {
    const list = await cfRequest<ListResp>(listUrl, token);
    let changed = false;
    
    for (const record of list.result || []) {
      if (record.proxied && (record.type === "A" || record.type === "AAAA" || record.type === "CNAME")) {
        console.log(`[cloudflare-dns-setup] Disabling proxy for existing record: ${record.type} ${record.name}`);
        
        await cfRequest(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`,
          token,
          { 
            method: "PATCH", 
            body: JSON.stringify({ proxied: false }) 
          }
        );
        changed = true;
      }
    }
    
    return changed;
  } catch (e) {
    console.error(`[cloudflare-dns-setup] Error checking/disabling proxy for ${recordName}:`, e);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { domainId, cloudflareApiToken } = (await req.json()) as SetupRequest;
    if (!domainId || !cloudflareApiToken?.trim()) {
      return new Response(JSON.stringify({ success: false, message: "Parâmetros inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: domain, error } = await supabase
      .from("custom_domains")
      .select("id, domain, verification_token")
      .eq("id", domainId)
      .single();

    if (error || !domain) {
      return new Response(JSON.stringify({ success: false, message: "Domínio não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rootDomain = getRootDomain(domain.domain);
    const zoneId = await getZoneId(rootDomain, cloudflareApiToken);

    // A records (root + www)
    await upsertRecord(zoneId, cloudflareApiToken, {
      type: "A",
      name: rootDomain,
      content: TARGET_IP,
    });
    await upsertRecord(zoneId, cloudflareApiToken, {
      type: "A",
      name: `www.${rootDomain}`,
      content: TARGET_IP,
    });

    // TXT for verification
    await upsertRecord(zoneId, cloudflareApiToken, {
      type: "TXT",
      name: `_acolheaqui.${rootDomain}`,
      content: `acolheaqui_verify=${domain.verification_token}`,
    });

    // Store zone id and user token for future cleanup/SSL provisioning
    await supabase
      .from("custom_domains")
      .update({ 
        cloudflare_zone_id: zoneId,
        cloudflare_api_token: cloudflareApiToken 
      })
      .eq("id", domainId);

    return new Response(
      JSON.stringify({ success: true, message: "Registros DNS configurados automaticamente no Cloudflare.", zoneId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("[cloudflare-dns-setup] Error:", errorMessage);
    return new Response(JSON.stringify({ success: false, message: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
