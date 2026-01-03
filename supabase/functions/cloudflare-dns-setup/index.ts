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

function getRootDomain(domain: string): string {
  const parts = domain.split(".").filter(Boolean);
  if (parts.length <= 2) return domain;
  return parts.slice(-2).join(".");
}

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

async function getZoneId(zoneName: string, token: string): Promise<string> {
  type ZonesResp = { success: boolean; result: Array<{ id: string; name: string }> };
  const url = `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(zoneName)}`;
  const data = await cfRequest<ZonesResp>(url, token);
  const zone = data.result?.[0];
  if (!zone?.id) throw new Error("Zona não encontrada no Cloudflare para este domínio");
  return zone.id;
}

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

    // Store zone id for future SSL provisioning (optional)
    await supabase
      .from("custom_domains")
      .update({ cloudflare_zone_id: zoneId })
      .eq("id", domainId);

    return new Response(
      JSON.stringify({ success: true, message: "Registros DNS configurados automaticamente no Cloudflare.", zoneId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[cloudflare-dns-setup] Error:", e);
    return new Response(JSON.stringify({ success: false, message: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
