import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AddDomainRequest {
  domainId: string;
}

const TARGET_IP = "149.248.203.97";

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
  const safeToken = token.trim();

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
    const errorCode = data?.errors?.[0]?.code;
    const errorMsg = data?.errors?.[0]?.message ?? `Cloudflare request failed (${res.status})`;
    
    if (res.status === 401 || res.status === 403 || errorCode === 9109) {
      throw new Error("Token de API do Cloudflare inválido ou sem permissões.");
    }
    
    throw new Error(errorMsg);
  }
  return data as T;
}

// Add a new zone (domain) to the Cloudflare account
async function addZoneToAccount(domain: string, accountId: string, token: string): Promise<string> {
  console.log(`[cloudflare-add-domain] Adding zone ${domain} to account ${accountId}`);
  
  // First check if zone already exists
  type ZonesResp = { success: boolean; result: Array<{ id: string; name: string }> };
  const checkUrl = `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(domain)}`;
  
  try {
    const existingZones = await cfRequest<ZonesResp>(checkUrl, token);
    if (existingZones.result?.length > 0) {
      console.log(`[cloudflare-add-domain] Zone ${domain} already exists with ID: ${existingZones.result[0].id}`);
      return existingZones.result[0].id;
    }
  } catch (e) {
    console.log(`[cloudflare-add-domain] Error checking existing zone:`, e);
  }

  // Create new zone
  type CreateZoneResp = { success: boolean; result: { id: string; name: string; name_servers: string[] } };
  const createUrl = "https://api.cloudflare.com/client/v4/zones";
  
  const createData = await cfRequest<CreateZoneResp>(createUrl, token, {
    method: "POST",
    body: JSON.stringify({
      name: domain,
      account: { id: accountId },
      type: "full",
    }),
  });

  console.log(`[cloudflare-add-domain] Zone created with ID: ${createData.result.id}`);
  console.log(`[cloudflare-add-domain] Nameservers: ${createData.result.name_servers.join(", ")}`);
  
  return createData.result.id;
}

// Get the nameservers for a zone
async function getZoneNameservers(zoneId: string, token: string): Promise<string[]> {
  type ZoneResp = { success: boolean; result: { name_servers: string[] } };
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}`;
  const data = await cfRequest<ZoneResp>(url, token);
  return data.result.name_servers || [];
}

// Upsert a DNS record
async function upsertRecord(zoneId: string, token: string, record: { type: string; name: string; content: string }) {
  type ListResp = { success: boolean; result: Array<{ id: string; type: string; name: string }> };
  const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=${record.type}&name=${encodeURIComponent(record.name)}`;
  const list = await cfRequest<ListResp>(listUrl, token);
  const existing = list.result?.[0];

  const payload = {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: 3600,
    proxied: false,
  };

  if (existing?.id) {
    await cfRequest(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existing.id}`,
      token,
      { method: "PUT", body: JSON.stringify(payload) }
    );
    return;
  }

  await cfRequest(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    token,
    { method: "POST", body: JSON.stringify(payload) }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cloudflareAccountId = Deno.env.get("CLOUDFLARE_ACCOUNT_ID")?.trim();
    const cloudflareApiToken = Deno.env.get("CLOUDFLARE_API_TOKEN")?.trim();
    
    if (!cloudflareAccountId || !cloudflareApiToken) {
      console.error("[cloudflare-add-domain] Missing Cloudflare credentials");
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Configuração do Cloudflare não encontrada. Contate o suporte." 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { domainId } = (await req.json()) as AddDomainRequest;

    if (!domainId) {
      return new Response(JSON.stringify({ success: false, message: "ID do domínio não fornecido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get domain info
    const { data: domain, error } = await supabase
      .from("custom_domains")
      .select("id, domain, verification_token, professional_id")
      .eq("id", domainId)
      .single();

    if (error || !domain) {
      return new Response(JSON.stringify({ success: false, message: "Domínio não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rootDomain = getRootDomain(domain.domain);
    console.log(`[cloudflare-add-domain] Processing domain: ${domain.domain}, root: ${rootDomain}`);

    // Step 1: Add domain to Cloudflare account (or get existing zone)
    const zoneId = await addZoneToAccount(rootDomain, cloudflareAccountId, cloudflareApiToken);

    // Step 2: Get nameservers
    const nameservers = await getZoneNameservers(zoneId, cloudflareApiToken);
    console.log(`[cloudflare-add-domain] Nameservers for ${rootDomain}: ${nameservers.join(", ")}`);

    // Step 3: Configure DNS records
    await upsertRecord(zoneId, cloudflareApiToken, { 
      type: "A", 
      name: rootDomain, 
      content: TARGET_IP 
    });
    console.log(`[cloudflare-add-domain] Created A record for ${rootDomain}`);

    await upsertRecord(zoneId, cloudflareApiToken, { 
      type: "A", 
      name: `www.${rootDomain}`, 
      content: TARGET_IP 
    });
    console.log(`[cloudflare-add-domain] Created A record for www.${rootDomain}`);

    await upsertRecord(zoneId, cloudflareApiToken, {
      type: "TXT",
      name: `_acolheaqui.${rootDomain}`,
      content: `acolheaqui_verify=${domain.verification_token}`,
    });
    console.log(`[cloudflare-add-domain] Created TXT record for _acolheaqui.${rootDomain}`);

    // Step 4: Update domain record with zone info
    await supabase
      .from("custom_domains")
      .update({ 
        cloudflare_zone_id: zoneId,
        status: "verifying"
      })
      .eq("id", domainId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Domínio adicionado ao Cloudflare com sucesso!",
        zoneId,
        nameservers,
        instructions: `Para ativar seu domínio, altere os nameservers no seu registrador para: ${nameservers.join(", ")}`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("[cloudflare-add-domain] Error:", errorMessage);
    return new Response(JSON.stringify({ success: false, message: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
