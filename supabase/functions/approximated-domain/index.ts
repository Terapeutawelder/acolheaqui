import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APPROXIMATED_API_URL = "https://cloud.approximated.app/api";
const CLUSTER_IP = "149.248.203.97";

interface ApproximatedRequest {
  action: "create" | "delete" | "status" | "verify";
  domainId: string;
}

interface VirtualHost {
  id: number;
  incoming_address: string;
  target_address: string;
  has_ssl: boolean;
  is_resolving: boolean;
  apx_hit: boolean;
  status: string;
  status_message: string;
  dns_pointed_at: string;
  ssl_active_from?: string;
  ssl_active_until?: string;
}

// TLDs públicos com múltiplos níveis
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

async function resolveARecords(fqdn: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(fqdn)}&type=A`,
      { headers: { "Accept": "application/dns-json" } }
    );

    if (!res.ok) {
      console.log(`[dns] A lookup failed for ${fqdn}: HTTP ${res.status}`);
      return [];
    }

    const data = await res.json().catch(() => null);
    const answers = (data?.Answer ?? []) as Array<{ type: number; data: string }>;

    return answers
      .filter((a) => a.type === 1 && typeof a.data === "string")
      .map((a) => a.data.trim());
  } catch (e) {
    console.log(`[dns] A lookup error for ${fqdn}:`, String(e));
    return [];
  }
}

async function isDomainPointingToCluster(domain: string): Promise<boolean> {
  const root = getRootDomain(domain);
  const candidates = new Set<string>([domain, root, `www.${root}`]);

  for (const fqdn of candidates) {
    const ips = await resolveARecords(fqdn);
    if (ips.includes(CLUSTER_IP)) return true;
  }

  return false;
}

async function approximatedRequest<T>(
  endpoint: string,
  apiKey: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${APPROXIMATED_API_URL}${endpoint}`, {
      ...options,
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options.headers,
      },
    });

    // Approximated can return non-JSON bodies for some responses (e.g. 404 "Not Found", delete confirmations)
    const raw = await response.text();
    let parsed: any = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }

    console.log(
      `[Approximated] ${options.method || "GET"} ${endpoint}:`,
      parsed ? JSON.stringify(parsed) : raw
    );

    if (!response.ok) {
      const errMsg =
        parsed?.errors ? JSON.stringify(parsed.errors) : (raw || `HTTP ${response.status}`);
      return { success: false, error: errMsg };
    }

    // Most endpoints return { data: ... }, but fall back to parsed/raw for others.
    const data = (parsed?.data ?? parsed ?? raw) as T;
    return { success: true, data };
  } catch (error) {
    console.error(`[Approximated] Error:`, error);
    return { success: false, error: String(error) };
  }
}

async function createVirtualHost(
  domain: string,
  targetAddress: string,
  apiKey: string
): Promise<{ success: boolean; vhost?: VirtualHost; error?: string }> {
  const result = await approximatedRequest<VirtualHost>("/vhosts", apiKey, {
    method: "POST",
    body: JSON.stringify({
      incoming_address: domain,
      target_address: targetAddress,
      target_ports: "443",
      redirect_www: !domain.startsWith("www."), // Auto-redirect www to root
    }),
  });

  if (result.success) {
    return { success: true, vhost: result.data };
  }

  return { success: false, error: result.error };
}

async function getVirtualHost(
  domain: string,
  apiKey: string
): Promise<{ success: boolean; vhost?: VirtualHost; error?: string }> {
  // Approximated API: /vhosts/by/incoming/:incoming_address
  const result = await approximatedRequest<VirtualHost>(
    `/vhosts/by/incoming/${encodeURIComponent(domain)}`,
    apiKey,
    {
      method: "GET",
    }
  );

  if (result.success) {
    return { success: true, vhost: result.data };
  }

  return { success: false, error: result.error };
}

async function deleteVirtualHost(
  domain: string,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  // Approximated API: DELETE /vhosts/by/incoming/:incoming_address
  const result = await approximatedRequest(
    `/vhosts/by/incoming/${encodeURIComponent(domain)}`,
    apiKey,
    {
      method: "DELETE",
    }
  );

  return result;
}


serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const approximatedApiKey = Deno.env.get("APPROXIMATED_API_KEY");

    if (!approximatedApiKey) {
      console.error("[approximated-domain] APPROXIMATED_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, message: "API key não configurada" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, domainId } = await req.json() as ApproximatedRequest;

    console.log(`[approximated-domain] Action: ${action}, DomainId: ${domainId}`);

    // Fetch the domain record
    const { data: domainRecord, error: fetchError } = await supabase
      .from("custom_domains")
      .select("*")
      .eq("id", domainId)
      .single();

    if (fetchError || !domainRecord) {
      console.error("[approximated-domain] Domain not found:", fetchError);
      return new Response(
        JSON.stringify({ success: false, message: "Domínio não encontrado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const domain = domainRecord.domain;
    // Target is your Lovable app's production domain
    const LOVABLE_APP_DOMAIN = "acolheaqui.lovable.app";
    const targetAddress = LOVABLE_APP_DOMAIN;

    if (action === "create") {
      // Create virtual host in Approximated
      const createResult = await createVirtualHost(domain, targetAddress, approximatedApiKey);

      if (!createResult.success) {
        // Check if already exists
        if (createResult.error?.includes("already been created")) {
          console.log(`[approximated-domain] Domain ${domain} already exists, fetching status`);
          const statusResult = await getVirtualHost(domain, approximatedApiKey);
          
          if (statusResult.success && statusResult.vhost) {
            const dnsOk = await isDomainPointingToCluster(domain);
            await updateDomainStatus(supabase, domainId, statusResult.vhost, dnsOk);
            
            return new Response(
              JSON.stringify({
                success: true,
                message: "Domínio já configurado! Configure o DNS para completar.",
                clusterIp: CLUSTER_IP,
                vhost: statusResult.vhost,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          // Domain exists in Approximated but we can't fetch it (different cluster or state issue)
          // Treat as success since the domain is already registered
          console.log(`[approximated-domain] Domain ${domain} exists but could not fetch status - continuing as success`);
          
          // Update domain to verifying status
          await supabase
            .from("custom_domains")
            .update({
              status: "verifying",
              ssl_status: "pending",
            })
            .eq("id", domainId);
          
          return new Response(
            JSON.stringify({
              success: true,
              message: "Domínio já registrado. Configure o DNS para completar.",
              clusterIp: CLUSTER_IP,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: false, message: createResult.error || "Erro ao criar virtual host" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Update domain status in database
      await supabase
        .from("custom_domains")
        .update({
          status: "verifying",
          ssl_status: "pending",
        })
        .eq("id", domainId);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Virtual host criado! Configure o DNS apontando para nosso IP.",
          clusterIp: CLUSTER_IP,
          vhost: createResult.vhost,
          dnsInstructions: {
            type: "A",
            name: "@",
            value: CLUSTER_IP,
            wwwName: "www",
            wwwValue: CLUSTER_IP,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify" || action === "status") {
      // Check virtual host status
      let statusResult = await getVirtualHost(domain, approximatedApiKey);

      if (!statusResult.success) {
        // Virtual host doesn't exist yet - try to create it automatically
        console.log(`[approximated-domain] Virtual host not found for ${domain}, attempting to create it`);

        // Use the Lovable app domain as target
        const createTargetAddress = "acolheaqui.lovable.app";

        console.log(`[approximated-domain] Creating virtual host with target: ${createTargetAddress}`);

        const createResult = await createVirtualHost(domain, createTargetAddress, approximatedApiKey);

        if (!createResult.success) {
          const errorMessage = createResult.error || "";
          console.log(`[approximated-domain] Create result error: ${errorMessage}`);

          // O vhost pode existir mesmo quando o DNS ainda não está correto (ex: Cloudflare proxied).
          // Então NÃO podemos assumir que "already been created" significa DNS verificado.
          if (errorMessage.includes("already been created")) {
            console.log(
              `[approximated-domain] Virtual host ${domain} já existe, mas DNS ainda pode não estar correto; mantendo status em verifying.`
            );

            await supabase
              .from("custom_domains")
              .update({
                status: "verifying",
                dns_verified: false,
                ssl_status: "pending",
              })
              .eq("id", domainId);

            return new Response(
              JSON.stringify({
                success: false,
                isPending: true,
                message:
                  "Aguardando DNS. Se você usa Cloudflare, desative o Proxy (nuvem laranja) e deixe como DNS only. Depois tente verificar novamente.",
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          console.error(`[approximated-domain] Failed to create virtual host: ${createResult.error}`);

          // Check if this is a Cloudflare-migrated domain
          if (domainRecord.cloudflare_zone_id) {
            return new Response(
              JSON.stringify({
                success: false,
                message: "Domínio sendo configurado. Por favor, aguarde alguns minutos e tente novamente.",
                isPending: true,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          return new Response(
            JSON.stringify({
              success: false,
              message: `Configure o registro A do domínio para apontar para ${CLUSTER_IP}`,
              clusterIp: CLUSTER_IP,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Virtual host created successfully, get its status
        console.log(`[approximated-domain] Virtual host created successfully for ${domain}`);
        statusResult = { success: true, vhost: createResult.vhost };
      }

      const vhost = statusResult.vhost!;

      // Double-check public DNS (avoids false negatives from provider-side caching)
      const dnsOk = await isDomainPointingToCluster(domain);
      console.log(
        `[approximated-domain] DNS check for ${domain}: dnsOk=${dnsOk}, provider.dns_pointed_at=${vhost.dns_pointed_at}, apx_hit=${vhost.apx_hit}, resolving=${vhost.is_resolving}`
      );

      await updateDomainStatus(supabase, domainId, vhost, dnsOk);

      const isActive = vhost.apx_hit && vhost.has_ssl;
      const isDnsOkButPending = dnsOk && !vhost.apx_hit && !vhost.is_resolving;

      if (isActive) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Domínio ativo com SSL! Seu site está funcionando.",
            clusterIp: CLUSTER_IP,
            vhost: {
              has_ssl: vhost.has_ssl,
              is_resolving: vhost.is_resolving,
              apx_hit: vhost.apx_hit,
              status: vhost.status,
              status_message: vhost.status_message,
              dns_pointed_at: vhost.dns_pointed_at,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (isDnsOkButPending) {
        return new Response(
          JSON.stringify({
            success: false,
            isPending: true,
            message:
              `Os registros A/TXT já estão corretos e o domínio aponta para ${CLUSTER_IP}. Agora é só aguardar a confirmação e a emissão do SSL (pode levar alguns minutos). Tente verificar novamente em 5–10 minutos.`,
            clusterIp: CLUSTER_IP,
            vhost: {
              has_ssl: vhost.has_ssl,
              is_resolving: vhost.is_resolving,
              apx_hit: vhost.apx_hit,
              status: vhost.status,
              status_message: vhost.status_message,
              dns_pointed_at: vhost.dns_pointed_at,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Provider indicates DNS still not correct (or still propagating)
      let message = "";
      if (vhost.apx_hit && !vhost.has_ssl) {
        message = "DNS configurado! SSL está sendo provisionado automaticamente.";
      } else if (vhost.is_resolving && !vhost.apx_hit) {
        message = "DNS está propagando. Aguarde alguns minutos.";
      } else {
        message = `Configure o registro A do domínio para apontar para ${CLUSTER_IP}`;
      }

      return new Response(
        JSON.stringify({
          success: vhost.apx_hit, // só considera sucesso quando o provedor já reconheceu o DNS
          isPending: !vhost.apx_hit,
          message,
          clusterIp: CLUSTER_IP,
          vhost: {
            has_ssl: vhost.has_ssl,
            is_resolving: vhost.is_resolving,
            apx_hit: vhost.apx_hit,
            status: vhost.status,
            status_message: vhost.status_message,
            dns_pointed_at: vhost.dns_pointed_at,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete") {
      const deleteResult = await deleteVirtualHost(domain, approximatedApiKey);

      if (!deleteResult.success) {
        return new Response(
          JSON.stringify({ success: false, message: deleteResult.error || "Erro ao remover virtual host" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Virtual host removido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Ação inválida" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  } catch (error) {
    console.error("[approximated-domain] Error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Erro interno do servidor" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function updateDomainStatus(
  supabase: any,
  domainId: string,
  vhost: VirtualHost,
  dnsOk: boolean
): Promise<void> {
  let status = "pending";
  let sslStatus = "pending";

  if (vhost.apx_hit && vhost.has_ssl) {
    status = "active";
    sslStatus = "active";
  } else if (vhost.apx_hit && !vhost.has_ssl) {
    status = "ready";
    sslStatus = "provisioning";
  } else if (vhost.is_resolving || dnsOk) {
    // dnsOk cobre casos em que o DNS já aponta corretamente, mas o provedor ainda não marcou apx_hit.
    status = "verifying";
    sslStatus = "pending";
  }

  const updateData: Record<string, any> = {
    status,
    ssl_status: sslStatus,
    dns_verified: vhost.apx_hit || dnsOk,
  };

  if (vhost.apx_hit || dnsOk) {
    updateData.dns_verified_at = new Date().toISOString();
  }

  if (vhost.has_ssl && vhost.ssl_active_from) {
    updateData.ssl_provisioned_at = vhost.ssl_active_from;
  }

  await supabase.from("custom_domains").update(updateData).eq("id", domainId);
}
