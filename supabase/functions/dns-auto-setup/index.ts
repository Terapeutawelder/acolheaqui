import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SetupRequest {
  domainId: string;
  provider: "cloudflare" | "godaddy" | "namecheap" | "hostinger" | "digitalocean" | "vercel";
  credentials: Record<string, string>;
}

const TARGET_IP = "149.248.203.97";

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

function getSldTld(domain: string): { sld: string; tld: string } {
  const parts = getRootDomain(domain).split(".");
  return { sld: parts[0], tld: parts.slice(1).join(".") };
}

// ========================== CLOUDFLARE ==========================

async function cfRequest<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const cleaned = token.replace(/[^\x20-\x7E]/g, "").trim();
  const sanitizedToken = cleaned.replace(/^Bearer\s+/i, "").replace(/\s+/g, "");
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${sanitizedToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json();
  
  // Better error handling for Cloudflare API responses
  if (!res.ok || data?.success === false) {
    const errorCode = data?.errors?.[0]?.code;
    const errorMsg = data?.errors?.[0]?.message ?? `Cloudflare request failed (${res.status})`;
    
    // Translate common Cloudflare errors to user-friendly messages
    if (res.status === 401 || res.status === 403 || errorCode === 9109 || errorMsg.includes('Invalid request headers')) {
      throw new Error("Token de API do Cloudflare inválido ou sem permissões. Verifique se o token tem permissões Zone:Read e DNS:Edit.");
    }
    if (errorCode === 7003 || errorMsg.includes('Could not route to')) {
      throw new Error("Não foi possível acessar a API do Cloudflare. Verifique suas credenciais.");
    }
    
    throw new Error(errorMsg);
  }
  return data as T;
}

async function cfVerifyToken(token: string): Promise<boolean> {
  try {
    const cleaned = token.replace(/[^\x20-\x7E]/g, "").trim();
    const sanitizedToken = cleaned.replace(/^Bearer\s+/i, "").replace(/\s+/g, "");
    const res = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
      headers: {
        Authorization: `Bearer ${sanitizedToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data?.success === true && data?.result?.status === "active";
  } catch {
    return false;
  }
}

async function cfGetZoneId(zoneName: string, token: string): Promise<string> {
  type ZonesResp = { success: boolean; result: Array<{ id: string; name: string }> };
  const url = `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(zoneName)}`;
  const data = await cfRequest<ZonesResp>(url, token);
  const zone = data.result?.[0];
  if (!zone?.id) throw new Error(`Zona "${zoneName}" não encontrada no Cloudflare. Certifique-se de que o domínio está configurado na sua conta Cloudflare.`);
  return zone.id;
}

async function cfUpsertRecord(zoneId: string, token: string, record: { type: string; name: string; content: string }) {
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

async function setupCloudflare(domain: string, verificationToken: string, apiToken: string): Promise<void> {
  const cleaned = apiToken.replace(/[^\x20-\x7E]/g, "").trim();
  const token = cleaned.replace(/^Bearer\s+/i, "").replace(/\s+/g, "");
  if (!token) throw new Error("Token de API Cloudflare não fornecido");

  const rootDomain = getRootDomain(domain);
  const zoneId = await cfGetZoneId(rootDomain, token);

  console.log(`[Cloudflare] Configuring DNS for ${rootDomain} (zone: ${zoneId})`);

  await cfUpsertRecord(zoneId, token, { type: "A", name: rootDomain, content: TARGET_IP });
  console.log(`[Cloudflare] Created A record for ${rootDomain}`);

  await cfUpsertRecord(zoneId, token, { type: "A", name: `www.${rootDomain}`, content: TARGET_IP });
  console.log(`[Cloudflare] Created A record for www.${rootDomain}`);

  await cfUpsertRecord(zoneId, token, {
    type: "TXT",
    name: `_acolheaqui.${rootDomain}`,
    content: `acolheaqui_verify=${verificationToken}`,
  });
  console.log(`[Cloudflare] Created TXT record for _acolheaqui.${rootDomain}`);
}

// ========================== GODADDY ==========================

async function gdRequest<T>(url: string, apiKey: string, apiSecret: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `sso-key ${apiKey}:${apiSecret}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GoDaddy request failed (${res.status}): ${text}`);
  }
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

async function setupGoDaddy(domain: string, verificationToken: string, apiKey: string, apiSecret: string): Promise<void> {
  const rootDomain = getRootDomain(domain);
  const baseUrl = `https://api.godaddy.com/v1/domains/${rootDomain}/records`;

  await gdRequest(`${baseUrl}/A/@`, apiKey, apiSecret, {
    method: "PUT",
    body: JSON.stringify([{ data: TARGET_IP, ttl: 3600 }]),
  });

  await gdRequest(`${baseUrl}/A/www`, apiKey, apiSecret, {
    method: "PUT",
    body: JSON.stringify([{ data: TARGET_IP, ttl: 3600 }]),
  });

  await gdRequest(`${baseUrl}/TXT/_acolheaqui`, apiKey, apiSecret, {
    method: "PUT",
    body: JSON.stringify([{ data: `acolheaqui_verify=${verificationToken}`, ttl: 3600 }]),
  });
}

// ========================== NAMECHEAP ==========================

function parseXml(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1] : null;
}

function extractErrors(xml: string): string[] {
  const errors: string[] = [];
  const regex = /<Error[^>]*>([^<]+)<\/Error>/gi;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    errors.push(match[1]);
  }
  return errors;
}

async function ncRequest(params: Record<string, string>, apiUser: string, apiKey: string, clientIp: string): Promise<string> {
  const baseUrl = "https://api.namecheap.com/xml.response";
  const queryParams = new URLSearchParams({
    ApiUser: apiUser,
    ApiKey: apiKey,
    UserName: apiUser,
    ClientIp: clientIp,
    ...params,
  });

  const res = await fetch(`${baseUrl}?${queryParams.toString()}`);
  const xml = await res.text();

  const status = parseXml(xml, "Status") || "";
  if (status.toLowerCase() === "error") {
    const errors = extractErrors(xml);
    throw new Error(`Namecheap API error: ${errors.join(", ") || "Unknown error"}`);
  }

  return xml;
}

interface NcHostRecord {
  HostName: string;
  RecordType: string;
  Address: string;
  TTL: string;
  MXPref?: string;
}

function parseHostRecords(xml: string): NcHostRecord[] {
  const records: NcHostRecord[] = [];
  const regex = /<host\s+([^>]+)\/>/gi;
  let match;

  while ((match = regex.exec(xml)) !== null) {
    const attrs = match[1];
    const getAttr = (name: string) => {
      const attrMatch = new RegExp(`${name}="([^"]*)"`, "i").exec(attrs);
      return attrMatch ? attrMatch[1] : "";
    };

    records.push({
      HostName: getAttr("Name"),
      RecordType: getAttr("Type"),
      Address: getAttr("Address"),
      TTL: getAttr("TTL") || "1800",
      MXPref: getAttr("MXPref"),
    });
  }

  return records;
}

async function setupNamecheap(domain: string, verificationToken: string, apiUser: string, apiKey: string, clientIp: string): Promise<void> {
  const { sld, tld } = getSldTld(domain);

  const getHostsXml = await ncRequest({
    Command: "namecheap.domains.dns.getHosts",
    SLD: sld,
    TLD: tld,
  }, apiUser, apiKey, clientIp);

  const existingRecords = parseHostRecords(getHostsXml);

  const recordsToKeep = existingRecords.filter(r => {
    if (r.RecordType === "A" && (r.HostName === "@" || r.HostName === "www")) return false;
    if (r.RecordType === "TXT" && r.HostName === "_acolheaqui") return false;
    return true;
  });

  const newRecords = [
    ...recordsToKeep,
    { HostName: "@", RecordType: "A", Address: TARGET_IP, TTL: "3600" },
    { HostName: "www", RecordType: "A", Address: TARGET_IP, TTL: "3600" },
    { HostName: "_acolheaqui", RecordType: "TXT", Address: `acolheaqui_verify=${verificationToken}`, TTL: "3600" },
  ];

  const setHostsParams: Record<string, string> = {
    Command: "namecheap.domains.dns.setHosts",
    SLD: sld,
    TLD: tld,
  };

  newRecords.forEach((rec, idx) => {
    const i = idx + 1;
    setHostsParams[`HostName${i}`] = rec.HostName;
    setHostsParams[`RecordType${i}`] = rec.RecordType;
    setHostsParams[`Address${i}`] = rec.Address;
    setHostsParams[`TTL${i}`] = rec.TTL;
    if (rec.MXPref) setHostsParams[`MXPref${i}`] = rec.MXPref;
  });

  await ncRequest(setHostsParams, apiUser, apiKey, clientIp);
}

// ========================== HOSTINGER ==========================

async function hostingerRequest<T>(url: string, apiToken: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Hostinger API error (${res.status}): ${text}`);
  }
  
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

async function setupHostinger(domain: string, verificationToken: string, apiToken: string): Promise<void> {
  const rootDomain = getRootDomain(domain);
  const baseUrl = `https://api.hostinger.com/v1/dns/${rootDomain}/records`;

  // Get existing records
  type RecordsResp = Array<{ id: string; type: string; name: string; content: string }>;
  let existingRecords: RecordsResp = [];
  try {
    existingRecords = await hostingerRequest<RecordsResp>(`https://api.hostinger.com/v1/dns/${rootDomain}/records`, apiToken);
  } catch {
    // If we can't get records, continue anyway
  }

  // Delete existing A records for @ and www
  for (const record of existingRecords) {
    if (record.type === "A" && (record.name === "@" || record.name === "" || record.name === "www")) {
      try {
        await hostingerRequest(`${baseUrl}/${record.id}`, apiToken, { method: "DELETE" });
      } catch {
        // Ignore deletion errors
      }
    }
    if (record.type === "TXT" && record.name === "_acolheaqui") {
      try {
        await hostingerRequest(`${baseUrl}/${record.id}`, apiToken, { method: "DELETE" });
      } catch {
        // Ignore deletion errors
      }
    }
  }

  // Create new records
  await hostingerRequest(baseUrl, apiToken, {
    method: "POST",
    body: JSON.stringify({ type: "A", name: "@", content: TARGET_IP, ttl: 3600 }),
  });

  await hostingerRequest(baseUrl, apiToken, {
    method: "POST",
    body: JSON.stringify({ type: "A", name: "www", content: TARGET_IP, ttl: 3600 }),
  });

  await hostingerRequest(baseUrl, apiToken, {
    method: "POST",
    body: JSON.stringify({ type: "TXT", name: "_acolheaqui", content: `acolheaqui_verify=${verificationToken}`, ttl: 3600 }),
  });
}

// ========================== DIGITALOCEAN ==========================

async function doRequest<T>(url: string, apiToken: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DigitalOcean API error (${res.status}): ${text}`);
  }
  
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

async function setupDigitalOcean(domain: string, verificationToken: string, apiToken: string): Promise<void> {
  const rootDomain = getRootDomain(domain);
  const baseUrl = `https://api.digitalocean.com/v2/domains/${rootDomain}/records`;

  // Get existing records
  type RecordsResp = { domain_records: Array<{ id: number; type: string; name: string }> };
  let existingRecords: RecordsResp = { domain_records: [] };
  try {
    existingRecords = await doRequest<RecordsResp>(baseUrl, apiToken);
  } catch {
    // Continue anyway
  }

  // Delete existing conflicting records
  for (const record of existingRecords.domain_records) {
    if (record.type === "A" && (record.name === "@" || record.name === "www")) {
      try {
        await doRequest(`${baseUrl}/${record.id}`, apiToken, { method: "DELETE" });
      } catch {
        // Ignore
      }
    }
    if (record.type === "TXT" && record.name === "_acolheaqui") {
      try {
        await doRequest(`${baseUrl}/${record.id}`, apiToken, { method: "DELETE" });
      } catch {
        // Ignore
      }
    }
  }

  // Create new records
  await doRequest(baseUrl, apiToken, {
    method: "POST",
    body: JSON.stringify({ type: "A", name: "@", data: TARGET_IP, ttl: 3600 }),
  });

  await doRequest(baseUrl, apiToken, {
    method: "POST",
    body: JSON.stringify({ type: "A", name: "www", data: TARGET_IP, ttl: 3600 }),
  });

  await doRequest(baseUrl, apiToken, {
    method: "POST",
    body: JSON.stringify({ type: "TXT", name: "_acolheaqui", data: `acolheaqui_verify=${verificationToken}`, ttl: 3600 }),
  });
}

// ========================== VERCEL ==========================

async function vercelRequest<T>(url: string, apiToken: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.error?.message || `Vercel API error (${res.status})`;
    throw new Error(msg);
  }
  
  return res.json() as Promise<T>;
}

async function setupVercel(domain: string, verificationToken: string, apiToken: string, teamId?: string): Promise<void> {
  const rootDomain = getRootDomain(domain);
  const teamQuery = teamId ? `?teamId=${teamId}` : "";
  const baseUrl = `https://api.vercel.com/v4/domains/${rootDomain}/records${teamQuery}`;

  // Get existing records
  type RecordsResp = { records: Array<{ id: string; type: string; name: string }> };
  let existingRecords: RecordsResp = { records: [] };
  try {
    existingRecords = await vercelRequest<RecordsResp>(baseUrl, apiToken);
  } catch {
    // Continue anyway
  }

  // Delete existing conflicting records
  for (const record of existingRecords.records) {
    if (record.type === "A" && (record.name === "" || record.name === "www")) {
      try {
        await vercelRequest(`https://api.vercel.com/v2/domains/${rootDomain}/records/${record.id}${teamQuery}`, apiToken, { method: "DELETE" });
      } catch {
        // Ignore
      }
    }
    if (record.type === "TXT" && record.name === "_acolheaqui") {
      try {
        await vercelRequest(`https://api.vercel.com/v2/domains/${rootDomain}/records/${record.id}${teamQuery}`, apiToken, { method: "DELETE" });
      } catch {
        // Ignore
      }
    }
  }

  // Create new records
  await vercelRequest(baseUrl, apiToken, {
    method: "POST",
    body: JSON.stringify({ type: "A", name: "", value: TARGET_IP, ttl: 3600 }),
  });

  await vercelRequest(baseUrl, apiToken, {
    method: "POST",
    body: JSON.stringify({ type: "A", name: "www", value: TARGET_IP, ttl: 3600 }),
  });

  await vercelRequest(baseUrl, apiToken, {
    method: "POST",
    body: JSON.stringify({ type: "TXT", name: "_acolheaqui", value: `acolheaqui_verify=${verificationToken}`, ttl: 3600 }),
  });
}

// ========================== MAIN HANDLER ==========================

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { domainId, provider, credentials } = (await req.json()) as SetupRequest;

    if (!domainId || !provider || !credentials) {
      return new Response(JSON.stringify({ success: false, message: "Parâmetros inválidos" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[dns-auto-setup] Provider: ${provider}, DomainId: ${domainId}`);

    const { data: domain, error } = await supabase
      .from("custom_domains")
      .select("id, domain, verification_token")
      .eq("id", domainId)
      .single();

    if (error || !domain) {
      return new Response(JSON.stringify({ success: false, message: "Domínio não encontrado" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    switch (provider) {
      case "cloudflare": {
        const apiToken = (credentials.apiToken || "").trim();
        if (!apiToken) throw new Error("Token de API Cloudflare não fornecido");
        await setupCloudflare(domain.domain, domain.verification_token, apiToken);
        break;
      }

      case "godaddy": {
        const { apiKey, apiSecret } = credentials;
        if (!apiKey || !apiSecret) throw new Error("Credenciais GoDaddy incompletas (apiKey e apiSecret necessários)");
        await setupGoDaddy(domain.domain, domain.verification_token, apiKey, apiSecret);
        break;
      }

      case "namecheap": {
        const { apiUser, apiKey, clientIp } = credentials;
        if (!apiUser || !apiKey || !clientIp) throw new Error("Credenciais Namecheap incompletas (apiUser, apiKey e clientIp necessários)");
        await setupNamecheap(domain.domain, domain.verification_token, apiUser, apiKey, clientIp);
        break;
      }

      case "hostinger": {
        const apiToken = credentials.apiToken;
        if (!apiToken) throw new Error("Token de API Hostinger não fornecido");
        await setupHostinger(domain.domain, domain.verification_token, apiToken);
        break;
      }

      case "digitalocean": {
        const apiToken = credentials.apiToken;
        if (!apiToken) throw new Error("Token de API DigitalOcean não fornecido");
        await setupDigitalOcean(domain.domain, domain.verification_token, apiToken);
        break;
      }

      case "vercel": {
        const { apiToken, teamId } = credentials;
        if (!apiToken) throw new Error("Token de API Vercel não fornecido");
        await setupVercel(domain.domain, domain.verification_token, apiToken, teamId);
        break;
      }

      default:
        throw new Error(`Provedor "${provider}" não suportado`);
    }

    // Update domain status
    await supabase
      .from("custom_domains")
      .update({ status: "verifying" })
      .eq("id", domainId);

    return new Response(
      JSON.stringify({ success: true, message: `Registros DNS configurados automaticamente via ${provider}!` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("[dns-auto-setup] Error:", errorMessage);
    return new Response(JSON.stringify({ success: false, message: errorMessage }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
