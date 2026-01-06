import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AddDomainRequest {
  domainId: string;
}

// IP do Lovable para custom domains
const TARGET_IP = "185.158.133.1";

// TLDs públicos com múltiplos níveis (ex: ".com.br").
const MULTI_PART_PUBLIC_SUFFIXES = new Set(["com.br", "net.br", "org.br", "gov.br", "edu.br"]);

function getRootDomain(domain: string): string {
  const parts = domain.split(".").filter(Boolean);
  
  // Primeiro checa se é um domínio com sufixo multi-parte (ex: .com.br)
  const last2 = parts.slice(-2).join(".");
  if (MULTI_PART_PUBLIC_SUFFIXES.has(last2)) {
    // Para sufixos multi-parte, precisamos de 3 partes para o domínio raiz
    // ex: acolheaqui.com.br → acolheaqui.com.br (não aqui.com.br!)
    if (parts.length >= 3) {
      return parts.slice(-3).join(".");
    }
    // Se tiver apenas 2 partes (ex: com.br), retorna o próprio domínio
    return domain;
  }
  
  // Para TLDs simples (ex: .com, .online), 2 partes são o mínimo
  if (parts.length <= 2) return domain;
  
  // Retorna as últimas 2 partes para TLDs simples
  return last2;
}

async function cfRequest<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  // Normaliza token (às vezes vem como "Authorization: Bearer xxx" ou com quebras de linha)
  const ascii = token.replace(/[^\x20-\x7E]/g, " ").trim();
  const bearerMatch = ascii.match(/bearer\s+([A-Za-z0-9._-]+)/i);
  const candidate = bearerMatch?.[1] ?? ascii;
  const longRun = candidate.match(/[A-Za-z0-9._-]{20,}/)?.[0];
  const safeToken = (longRun ?? candidate).replace(/\s+/g, "");

  if (!safeToken) {
    throw new Error("Credencial do Cloudflare inválida (token vazio)");
  }

  const headers = new Headers(init?.headers ?? {});
  headers.set("Authorization", `Bearer ${safeToken}`);
  headers.set("Accept", "application/json");
  if (init?.body) headers.set("Content-Type", "application/json");

  const res = await fetch(url, { ...init, headers });

  const raw = await res.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    // Cloudflare deveria retornar JSON; se não retornar, devolvemos o corpo cru para debug.
    throw new Error(raw || `Cloudflare request failed (${res.status})`);
  }

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
// Returns { zoneId, alreadyExists } to indicate if zone was already configured
async function addZoneToAccount(domain: string, accountId: string, token: string): Promise<{ zoneId: string; alreadyExists: boolean }> {
  console.log(`[cloudflare-add-domain] Adding zone ${domain} to account ${accountId}`);
  
  // First check if zone already exists
  type ZonesResp = { success: boolean; result: Array<{ id: string; name: string }> };
  const checkUrl = `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(domain)}`;
  
  try {
    const existingZones = await cfRequest<ZonesResp>(checkUrl, token);
    if (existingZones.result?.length > 0) {
      console.log(`[cloudflare-add-domain] Zone ${domain} already exists with ID: ${existingZones.result[0].id}`);
      return { zoneId: existingZones.result[0].id, alreadyExists: true };
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
  
  return { zoneId: createData.result.id, alreadyExists: false };
}

// Get the nameservers for a zone
async function getZoneNameservers(zoneId: string, token: string): Promise<string[]> {
  type ZoneResp = { success: boolean; result: { name_servers: string[] } };
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}`;
  const data = await cfRequest<ZoneResp>(url, token);
  return data.result.name_servers || [];
}

// Upsert DNS records in a safe way for Lovable custom domains.
// Important: Cloudflare Error 1000 happens when a proxied record points to a Cloudflare IP.
// Our target IP may be in Cloudflare-owned ranges, so we MUST enforce DNS-only (proxied=false)
// and delete conflicting records (CNAME/AAAA/other A values).
async function upsertRecord(
  zoneId: string,
  token: string,
  record: { type: string; name: string; content: string }
) {
  type ListByNameResp = {
    success: boolean;
    result: Array<{ id: string; type: string; name: string; content: string; proxied?: boolean }>;
  };

  const listByNameUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${encodeURIComponent(record.name)}`;
  const byName = await cfRequest<ListByNameResp>(listByNameUrl, token);
  const existingForName = byName.result ?? [];

  const deleteRecord = async (id: string, reason: string) => {
    console.log(`[cloudflare-add-domain] Deleting record (${reason}) id=${id}`);
    await cfRequest(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${id}`, token, {
      method: "DELETE",
    });
  };

  // 1) Cleanup conflicts for A records
  if (record.type === "A") {
    // Remove CNAME/AAAA at same hostname, and A records pointing to other IPs.
    const correctA = existingForName.filter((r) => r.type === "A" && r.content === record.content);
    const wrongA = existingForName.filter((r) => r.type === "A" && r.content !== record.content);
    const conflicts = existingForName.filter((r) => r.type === "CNAME" || r.type === "AAAA");

    for (const r of [...conflicts, ...wrongA]) {
      await deleteRecord(r.id, `${r.type} conflict`);
    }

    // If there are multiple correct A records, keep only one (Cloudflare proxy state is per-record).
    const keep = correctA[0];
    for (const extra of correctA.slice(1)) {
      await deleteRecord(extra.id, "duplicate A");
    }

    const payload: Record<string, unknown> = {
      type: "A",
      name: record.name,
      content: record.content,
      ttl: 3600,
      proxied: false, // DNS-only (critical)
    };

    if (keep?.id) {
      await cfRequest(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${keep.id}`,
        token,
        { method: "PUT", body: JSON.stringify(payload) }
      );
      console.log(`[cloudflare-add-domain] Ensured A DNS-only for ${record.name} -> ${record.content}`);
      return;
    }

    await cfRequest(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log(`[cloudflare-add-domain] Created A DNS-only for ${record.name} -> ${record.content}`);
    return;
  }

  // 2) TXT records: keep only one and enforce the expected content
  if (record.type === "TXT") {
    const existingTxt = existingForName.filter((r) => r.type === "TXT");
    const keep = existingTxt[0];

    for (const extra of existingTxt.slice(1)) {
      await deleteRecord(extra.id, "duplicate TXT");
    }

    const payload: Record<string, unknown> = {
      type: "TXT",
      name: record.name,
      content: record.content,
      ttl: 3600,
    };

    if (keep?.id) {
      await cfRequest(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${keep.id}`,
        token,
        { method: "PUT", body: JSON.stringify(payload) }
      );
      console.log(`[cloudflare-add-domain] Ensured TXT for ${record.name}`);
      return;
    }

    await cfRequest(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log(`[cloudflare-add-domain] Created TXT for ${record.name}`);
    return;
  }

  // Default behavior for other types (currently unused here)
  type ListResp = { success: boolean; result: Array<{ id: string; type: string; name: string }> };
  const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=${record.type}&name=${encodeURIComponent(record.name)}`;
  const list = await cfRequest<ListResp>(listUrl, token);
  const existing = list.result?.[0];

  const payload: Record<string, unknown> = {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: 3600,
  };

  if (existing?.id) {
    await cfRequest(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existing.id}`,
      token,
      { method: "PUT", body: JSON.stringify(payload) }
    );
    return;
  }

  await cfRequest(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cloudflareAccountId = Deno.env.get("CLOUDFLARE_ACCOUNT_ID")?.replace(/\s+/g, "");
    const cloudflareApiToken = Deno.env.get("CLOUDFLARE_API_TOKEN")?.replace(/\s+/g, "");
    
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
    const { zoneId, alreadyExists } = await addZoneToAccount(rootDomain, cloudflareAccountId, cloudflareApiToken);

    // Step 2: Get nameservers (only needed if zone was just created)
    let nameservers: string[] = [];
    if (!alreadyExists) {
      nameservers = await getZoneNameservers(zoneId, cloudflareApiToken);
      console.log(`[cloudflare-add-domain] Nameservers for ${rootDomain}: ${nameservers.join(", ")}`);
    }

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

    await upsertRecord(zoneId, cloudflareApiToken, {
      type: "TXT",
      name: `_acolheaqui.www.${rootDomain}`,
      content: `acolheaqui_verify=${domain.verification_token}`,
    });
    console.log(`[cloudflare-add-domain] Created TXT record for _acolheaqui.www.${rootDomain}`);

    // Step 4: Update domain record with zone info
    // If zone already existed, set status to verifying right away
    await supabase
      .from("custom_domains")
      .update({ 
        cloudflare_zone_id: zoneId,
        status: "verifying"
      })
      .eq("id", domainId);

    // Return different response based on whether zone already existed
    if (alreadyExists) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          alreadyOnCloudflare: true,
          message: "Domínio já está no Cloudflare! Registros DNS configurados automaticamente.",
          zoneId,
          nameservers: [] // No need to change nameservers
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        alreadyOnCloudflare: false,
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
