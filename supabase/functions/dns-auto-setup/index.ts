import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SetupRequest {
  domainId: string;
  provider: "cloudflare" | "godaddy" | "namecheap";
  credentials: Record<string, string>;
}

const TARGET_IP = "185.158.133.1";

function getRootDomain(domain: string): string {
  const parts = domain.split(".").filter(Boolean);
  if (parts.length <= 2) return domain;
  return parts.slice(-2).join(".");
}

function getSldTld(domain: string): { sld: string; tld: string } {
  const parts = getRootDomain(domain).split(".");
  return { sld: parts[0], tld: parts.slice(1).join(".") };
}

// ========================== CLOUDFLARE ==========================

async function cfRequest<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
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

async function cfGetZoneId(zoneName: string, token: string): Promise<string> {
  type ZonesResp = { success: boolean; result: Array<{ id: string; name: string }> };
  const url = `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(zoneName)}`;
  const data = await cfRequest<ZonesResp>(url, token);
  const zone = data.result?.[0];
  if (!zone?.id) throw new Error("Zona não encontrada no Cloudflare para este domínio");
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
  const rootDomain = getRootDomain(domain);
  const zoneId = await cfGetZoneId(rootDomain, apiToken);

  await cfUpsertRecord(zoneId, apiToken, { type: "A", name: rootDomain, content: TARGET_IP });
  await cfUpsertRecord(zoneId, apiToken, { type: "A", name: `www.${rootDomain}`, content: TARGET_IP });
  await cfUpsertRecord(zoneId, apiToken, { type: "TXT", name: `_acolheaqui.${rootDomain}`, content: `acolheaqui_verify=${verificationToken}` });
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
  // Some endpoints return empty body
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

async function setupGoDaddy(domain: string, verificationToken: string, apiKey: string, apiSecret: string): Promise<void> {
  const rootDomain = getRootDomain(domain);
  const baseUrl = `https://api.godaddy.com/v1/domains/${rootDomain}/records`;

  // GoDaddy PATCH replaces all records of the given type/name, so we need to be careful
  // We'll use PUT to specific type/name endpoint

  // A record for @ (root)
  await gdRequest(`${baseUrl}/A/@`, apiKey, apiSecret, {
    method: "PUT",
    body: JSON.stringify([{ data: TARGET_IP, ttl: 3600 }]),
  });

  // A record for www
  await gdRequest(`${baseUrl}/A/www`, apiKey, apiSecret, {
    method: "PUT",
    body: JSON.stringify([{ data: TARGET_IP, ttl: 3600 }]),
  });

  // TXT record for _acolheaqui
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

  // Check for errors
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

  // 1. Get existing host records
  const getHostsXml = await ncRequest({
    Command: "namecheap.domains.dns.getHosts",
    SLD: sld,
    TLD: tld,
  }, apiUser, apiKey, clientIp);

  const existingRecords = parseHostRecords(getHostsXml);

  // 2. Filter out records we want to replace
  const recordsToKeep = existingRecords.filter(r => {
    if (r.RecordType === "A" && (r.HostName === "@" || r.HostName === "www")) return false;
    if (r.RecordType === "TXT" && r.HostName === "_acolheaqui") return false;
    return true;
  });

  // 3. Add our records
  const newRecords = [
    ...recordsToKeep,
    { HostName: "@", RecordType: "A", Address: TARGET_IP, TTL: "3600" },
    { HostName: "www", RecordType: "A", Address: TARGET_IP, TTL: "3600" },
    { HostName: "_acolheaqui", RecordType: "TXT", Address: `acolheaqui_verify=${verificationToken}`, TTL: "3600" },
  ];

  // 4. Build setHosts params
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
        status: 400,
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
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    switch (provider) {
      case "cloudflare": {
        const apiToken = credentials.apiToken;
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
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
