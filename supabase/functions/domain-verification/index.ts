import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  action: "verify" | "provision_ssl";
  domainId: string;
}

// IP do Lovable para custom domains
const TARGET_IP = "185.158.133.1";

// TLDs públicos com múltiplos níveis (ex: ".com.br")
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cloudflareApiToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const cloudflareZoneId = Deno.env.get("CLOUDFLARE_ZONE_ID");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, domainId } = await req.json() as VerifyRequest;

    console.log(`[domain-verification] Action: ${action}, DomainId: ${domainId}`);

    // Fetch the domain record
    const { data: domain, error: fetchError } = await supabase
      .from("custom_domains")
      .select("*")
      .eq("id", domainId)
      .single();

    if (fetchError || !domain) {
      console.error("[domain-verification] Domain not found:", fetchError);
      return new Response(
        JSON.stringify({ success: false, message: "Domínio não encontrado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    if (action === "verify") {
      // Step 0: If we have Cloudflare credentials, try to disable proxy first
      const cfToken = domain.cloudflare_api_token || cloudflareApiToken;
      const cfZoneId = domain.cloudflare_zone_id || cloudflareZoneId;
      
      if (cfToken && cfZoneId) {
        console.log("[domain-verification] Attempting to disable Cloudflare proxy if enabled...");
        await disableCloudflareProxy(domain.domain, cfToken, cfZoneId);
      }

      // Step 1: Check DNS TXT record for verification
      const txtRecordValid = await verifyTxtRecord(domain.domain, domain.verification_token);
      
      if (!txtRecordValid) {
        await supabase
          .from("custom_domains")
          .update({ status: "pending", dns_verified: false })
          .eq("id", domainId);

        return new Response(
          JSON.stringify({
            success: false,
            message: "Registro TXT não encontrado. Verifique a configuração DNS.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Step 2: Check A record pointing to our IP
      const aRecordValid = await verifyARecord(domain.domain);

      if (!aRecordValid) {
        await supabase
          .from("custom_domains")
          .update({ status: "pending", dns_verified: false })
          .eq("id", domainId);

        return new Response(
          JSON.stringify({
            success: false,
            message: `Registro A não está apontando para o IP correto (${TARGET_IP}).`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // DNS verified - update status
      await supabase
        .from("custom_domains")
        .update({
          status: "ready",
          ssl_status: "provisioning",
          dns_verified: true,
          dns_verified_at: new Date().toISOString(),
        })
        .eq("id", domainId);

      // Step 3: If Cloudflare credentials are available, try to provision SSL
      if (cfToken && cfZoneId) {
        console.log("[domain-verification] Attempting Cloudflare SSL provisioning...");

        const sslResult = await provisionCloudflareSSL(domain.domain, cfToken, cfZoneId);

        if (sslResult.success) {
          await supabase
            .from("custom_domains")
            .update({
              status: "active",
              ssl_status: "active",
              ssl_provisioned_at: new Date().toISOString(),
              cloudflare_zone_id: cfZoneId,
            })
            .eq("id", domainId);

          // Send activation notification email
          try {
            await fetch(`${supabaseUrl}/functions/v1/send-domain-notification`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({ domainId, type: "activated" }),
            });
            console.log("[domain-verification] Activation notification sent");
          } catch (emailError) {
            console.error("[domain-verification] Failed to send notification:", emailError);
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: "DNS verificado e SSL ativado! Seu domínio está pronto.",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // SSL still provisioning (or Cloudflare not available)
      return new Response(
        JSON.stringify({
          success: true,
          message: "DNS verificado com sucesso! O SSL está sendo provisionado e pode levar alguns minutos.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Ação inválida" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  } catch (error) {
    console.error("[domain-verification] Error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Erro interno do servidor" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function verifyTxtRecord(domain: string, expectedToken: string): Promise<boolean> {
  const expectedValue = `acolheaqui_verify=${expectedToken}`;

  const queryTxt = async (fqdn: string): Promise<boolean> => {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(fqdn)}&type=TXT`,
      { headers: { Accept: "application/dns-json" } }
    );

    if (!response.ok) {
      console.log(`[verifyTxtRecord] DNS query failed for ${fqdn}`);
      return false;
    }

    const data = await response.json();
    console.log(`[verifyTxtRecord] DNS response for ${fqdn}:`, JSON.stringify(data));

    if (!data.Answer || data.Answer.length === 0) return false;

    for (const answer of data.Answer) {
      // TXT records come with quotes, need to clean them
      const txtValue = answer.data?.replace(/"/g, "").trim();
      if (txtValue === expectedValue) {
        console.log(`[verifyTxtRecord] TXT record verified for ${fqdn}`);
        return true;
      }
    }

    return false;
  };

  try {
    // Aceita TXT tanto no domínio informado quanto no domínio raiz (ex: www.exemplo.com → exemplo.com).
    const candidates = new Set<string>();
    candidates.add(`_acolheaqui.${domain}`);

    const root = getRootDomain(domain);
    if (root && root !== domain) {
      candidates.add(`_acolheaqui.${root}`);
    }

    for (const fqdn of candidates) {
      if (await queryTxt(fqdn)) return true;
    }

    return false;
  } catch (error) {
    console.error(`[verifyTxtRecord] Error checking TXT for ${domain}:`, error);
    return false;
  }
}

async function verifyARecord(domain: string): Promise<boolean> {
  try {
    const expectedIP = TARGET_IP;
    
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
      {
        headers: { Accept: "application/dns-json" },
      }
    );

    if (!response.ok) {
      console.log(`[verifyARecord] DNS query failed for ${domain}`);
      return false;
    }

    const data = await response.json();
    console.log(`[verifyARecord] DNS response for ${domain}:`, JSON.stringify(data));

    if (!data.Answer || data.Answer.length === 0) {
      return false;
    }

    for (const answer of data.Answer) {
      if (answer.data === expectedIP) {
        console.log(`[verifyARecord] A record verified for ${domain}`);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`[verifyARecord] Error checking A record for ${domain}:`, error);
    return false;
  }
}

// Function to disable Cloudflare proxy on existing DNS records
async function disableCloudflareProxy(domain: string, apiToken: string, zoneId: string): Promise<void> {
  try {
    const rootDomain = getRootDomain(domain);
    const recordsToCheck = [domain, rootDomain, `www.${rootDomain}`];
    
    // Clean the token
    const cleaned = apiToken.replace(/[^\x20-\x7E]/g, "").trim();
    const safeToken = cleaned.replace(/^Bearer\s+/i, "").replace(/\s+/g, "");
    
    for (const recordName of recordsToCheck) {
      const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${encodeURIComponent(recordName)}`;
      
      const listRes = await fetch(listUrl, {
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!listRes.ok) {
        console.log(`[disableCloudflareProxy] Failed to list records for ${recordName}`);
        continue;
      }
      
      const listData = await listRes.json();
      
      for (const record of listData.result || []) {
        if (record.proxied && (record.type === "A" || record.type === "AAAA" || record.type === "CNAME")) {
          console.log(`[disableCloudflareProxy] Disabling proxy for ${record.type} ${record.name} (id: ${record.id})`);
          
          const updateRes = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${safeToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ proxied: false }),
            }
          );
          
          if (updateRes.ok) {
            console.log(`[disableCloudflareProxy] Successfully disabled proxy for ${record.name}`);
          } else {
            const errData = await updateRes.json();
            console.error(`[disableCloudflareProxy] Failed to disable proxy for ${record.name}:`, errData);
          }
        }
      }
    }
  } catch (error) {
    console.error(`[disableCloudflareProxy] Error:`, error);
  }
}

async function provisionCloudflareSSL(
  domain: string,
  apiToken: string,
  zoneId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create custom hostname in Cloudflare for SSL for SaaS
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hostname: domain,
          ssl: {
            method: "http",
            type: "dv",
            settings: {
              min_tls_version: "1.2",
            },
          },
        }),
      }
    );

    const data = await response.json();
    console.log(`[provisionCloudflareSSL] Response for ${domain}:`, JSON.stringify(data));

    if (data.success) {
      return { success: true };
    }

    // Check if hostname already exists (code 1406)
    if (data.errors?.some((e: any) => e.code === 1406)) {
      console.log(`[provisionCloudflareSSL] Hostname ${domain} already exists`);
      return { success: true };
    }

    return {
      success: false,
      error: data.errors?.[0]?.message || "Failed to provision SSL",
    };
  } catch (error) {
    console.error(`[provisionCloudflareSSL] Error for ${domain}:`, error);
    return { success: false, error: String(error) };
  }
}
