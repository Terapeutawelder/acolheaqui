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

// IP do Lovable para custom domains (não usa mais Approximated)
const TARGET_IP = "185.158.133.1";

// TLDs públicos com múltiplos níveis (ex: ".com.br").
// Sem isso, "exemplo.com.br" viraria "com.br" e quebraria a automação.
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

function normalizeCfToken(token: string): string {
  // Remove non-printable ASCII chars, trim whitespace, handle "Bearer " prefix
  return token
    .replace(/[^\x20-\x7E]/g, "")
    .trim()
    .replace(/^Bearer\s+/i, "")
    .replace(/\s+/g, "");
}

function friendlyCloudflareAuthError(): string {
  return "Token do Cloudflare inválido. Use um API Token (não é senha) com permissões Zone:Read e DNS:Edit para este domínio.";
}

async function cfRequest<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const safeToken = normalizeCfToken(token);

  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${safeToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await res.text();

  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Cloudflare retornou resposta inválida (HTTP ${res.status}).`);
  }

  if (!res.ok || data?.success === false) {
    const first = data?.errors?.[0];
    const msg: string = first?.message ?? `Cloudflare request failed (${res.status})`;

    const chainStr = JSON.stringify(first?.error_chain ?? []).toLowerCase();
    const msgLower = String(msg).toLowerCase();

    // Common auth/header failures
    if (
      res.status === 401 ||
      res.status === 403 ||
      msgLower.includes("invalid request headers") ||
      chainStr.includes("authorization")
    ) {
      throw new Error(friendlyCloudflareAuthError());
    }

    throw new Error(msg);
  }

  return data as T;
}

async function verifyCloudflareToken(token: string): Promise<boolean> {
  try {
    const safeToken = normalizeCfToken(token);

    // Very quick heuristic: real CF API tokens are long; this avoids sending obvious garbage.
    if (safeToken.length < 30) return false;

    const res = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
      headers: {
        Authorization: `Bearer ${safeToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json().catch(() => null);
    return data?.success === true && data?.result?.status === "active";
  } catch {
    return false;
  }
}

async function getZoneId(zoneName: string, token: string): Promise<string> {
  type ZonesResp = { success: boolean; result: Array<{ id: string; name: string }> };
  const url = `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(zoneName)}`;
  const data = await cfRequest<ZonesResp>(url, token);
  const zone = data.result?.[0];
  if (!zone?.id) throw new Error("Zona não encontrada no Cloudflare para este domínio");
  return zone.id;
}

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
    console.log(`[cloudflare-dns-setup] Deleting record (${reason}) id=${id}`);
    await cfRequest(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${id}`, token, {
      method: "DELETE",
    });
  };

  // For A records we MUST enforce DNS-only (proxied=false) to avoid Error 1000.
  if (record.type === "A") {
    const correctA = existingForName.filter((r) => r.type === "A" && r.content === record.content);
    const wrongA = existingForName.filter((r) => r.type === "A" && r.content !== record.content);
    const conflicts = existingForName.filter((r) => r.type === "CNAME" || r.type === "AAAA");

    for (const r of [...conflicts, ...wrongA]) {
      await deleteRecord(r.id, `${r.type} conflict`);
    }

    const keep = correctA[0];
    for (const extra of correctA.slice(1)) {
      await deleteRecord(extra.id, "duplicate A");
    }

    const payload: Record<string, unknown> = {
      type: "A",
      name: record.name,
      content: record.content,
      ttl: 3600,
      proxied: false,
    };

    if (keep?.id) {
      await cfRequest(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${keep.id}`,
        token,
        { method: "PUT", body: JSON.stringify(payload) }
      );
      console.log(`[cloudflare-dns-setup] Ensured A DNS-only for ${record.name} -> ${record.content}`);
      return;
    }

    await cfRequest(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log(`[cloudflare-dns-setup] Created A DNS-only for ${record.name} -> ${record.content}`);
    return;
  }

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
      console.log(`[cloudflare-dns-setup] Ensured TXT for ${record.name}`);
      return;
    }

    await cfRequest(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log(`[cloudflare-dns-setup] Created TXT for ${record.name}`);
    return;
  }

  // Fallback for other types
  type ListResp = {
    success: boolean;
    result: Array<{ id: string; type: string; name: string; content: string; proxied?: boolean }>;
  };

  const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=${record.type}&name=${encodeURIComponent(record.name)}`;
  const list = await cfRequest<ListResp>(listUrl, token);
  const existing = list.result?.[0];

  const payload: Record<string, unknown> = {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: 3600,
  };

  if (record.type === "A" || record.type === "AAAA" || record.type === "CNAME") {
    payload.proxied = false;
  }

  if (existing?.id) {
    await cfRequest(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existing.id}`,
      token,
      { method: "PUT", body: JSON.stringify(payload) }
    );
    console.log(`[cloudflare-dns-setup] Updated record ${record.type} ${record.name}`);
    return;
  }

  await cfRequest(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  console.log(`[cloudflare-dns-setup] Created record ${record.type} ${record.name}`);
}


// Disable proxy on existing records (best-effort)
async function disableProxyIfNeeded(zoneId: string, token: string, recordName: string): Promise<void> {
  type ListResp = {
    success: boolean;
    result: Array<{ id: string; type: string; name: string; content: string; proxied?: boolean }>;
  };

  const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${encodeURIComponent(recordName)}`;

  const list = await cfRequest<ListResp>(listUrl, token);

  for (const record of list.result || []) {
    if (record.proxied && (record.type === "A" || record.type === "AAAA" || record.type === "CNAME")) {
      console.log(`[cloudflare-dns-setup] Disabling proxy for existing record: ${record.type} ${record.name}`);

      await cfRequest(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({ proxied: false }),
        }
      );
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = (await req.json().catch(() => null)) as SetupRequest | null;
    const domainId = body?.domainId;
    const cloudflareApiToken = body?.cloudflareApiToken;

    if (!domainId || !cloudflareApiToken?.trim()) {
      return new Response(JSON.stringify({ success: false, message: "Parâmetros inválidos" }), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    const tokenIsValid = await verifyCloudflareToken(cloudflareApiToken);
    if (!tokenIsValid) {
      return new Response(JSON.stringify({ success: false, message: friendlyCloudflareAuthError() }), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    const { data: domain, error } = await supabase
      .from("custom_domains")
      .select("id, domain, verification_token")
      .eq("id", domainId)
      .single();

    if (error || !domain) {
      return new Response(JSON.stringify({ success: false, message: "Domínio não encontrado" }), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    const rootDomain = getRootDomain(domain.domain);
    console.log(`[cloudflare-dns-setup] Setting up DNS for ${domain.domain} (root: ${rootDomain})`);

    const zoneId = await getZoneId(rootDomain, cloudflareApiToken);

    // Best-effort: disable proxy if it exists (Cloudflare-specific)
    await disableProxyIfNeeded(zoneId, cloudflareApiToken, rootDomain);
    await disableProxyIfNeeded(zoneId, cloudflareApiToken, `www.${rootDomain}`);

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

    // TXT for verification (root domain)
    await upsertRecord(zoneId, cloudflareApiToken, {
      type: "TXT",
      name: `_acolheaqui.${rootDomain}`,
      content: `acolheaqui_verify=${domain.verification_token}`,
    });

    // TXT for verification (www subdomain) - required like Lovable does
    await upsertRecord(zoneId, cloudflareApiToken, {
      type: "TXT",
      name: `_acolheaqui.www.${rootDomain}`,
      content: `acolheaqui_verify=${domain.verification_token}`,
    });

    // Store zone id and user token for future cleanup
    await supabase
      .from("custom_domains")
      .update({ cloudflare_zone_id: zoneId, cloudflare_api_token: cloudflareApiToken })
      .eq("id", domainId);

    return new Response(
      JSON.stringify({ success: true, message: "Registros DNS configurados automaticamente no Cloudflare.", zoneId }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("[cloudflare-dns-setup] Error:", errorMessage);

    return new Response(JSON.stringify({ success: false, message: errorMessage }), {
      status: 200,
      headers: jsonHeaders,
    });
  }
});
