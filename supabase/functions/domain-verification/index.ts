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
      const cfToken = domain.cloudflare_api_token || cloudflareApiToken;
      const cfZoneId = domain.cloudflare_zone_id || cloudflareZoneId;

      // Step 0: Auto-diagnose DNS public resolution vs expected IP
      // If DNS public resolves to wrong IP but we have CF credentials, auto-fix
      const publicARecords = await getPublicARecords(domain.domain);
      const rootDomain = getRootDomain(domain.domain);
      const publicRootRecords = await getPublicARecords(rootDomain);
      
      const allPublicIPs = [...new Set([...publicARecords, ...publicRootRecords])];
      const hasWrongIP = allPublicIPs.length > 0 && !allPublicIPs.includes(TARGET_IP);
      const hasMissingIP = allPublicIPs.length === 0 || !allPublicIPs.includes(TARGET_IP);
      
      console.log(`[domain-verification] Public DNS IPs for ${domain.domain}: ${allPublicIPs.join(", ") || "(none)"}`);
      console.log(`[domain-verification] Expected IP: ${TARGET_IP}, hasWrongIP: ${hasWrongIP}, hasMissingIP: ${hasMissingIP}`);

      if ((hasWrongIP || hasMissingIP) && cfToken && cfZoneId) {
        console.log("[domain-verification] DNS mismatch detected, auto-repairing via Cloudflare API...");
        await autoRepairCloudflareRecords(rootDomain, cfToken, cfZoneId, domain.verification_token);
        
        // After repair, we need to wait for DNS propagation
        // Return a message telling user to wait and retry
        await supabase
          .from("custom_domains")
          .update({ status: "verifying" })
          .eq("id", domainId);

        return new Response(
          JSON.stringify({
            success: false,
            isPending: true,
            message: "Registros DNS foram corrigidos automaticamente. Aguarde alguns minutos para a propagação e tente novamente.",
            autoRepaired: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If we have Cloudflare credentials, ensure proxy is disabled
      if (cfToken && cfZoneId) {
        console.log("[domain-verification] Ensuring Cloudflare proxy is disabled...");
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
        // One more attempt: if we have CF credentials, try to repair and inform user
        if (cfToken && cfZoneId) {
          console.log("[domain-verification] A record invalid, attempting repair...");
          await autoRepairCloudflareRecords(rootDomain, cfToken, cfZoneId, domain.verification_token);
        }

        await supabase
          .from("custom_domains")
          .update({ status: "verifying", dns_verified: false })
          .eq("id", domainId);

        return new Response(
          JSON.stringify({
            success: false,
            isPending: true,
            message: `Registro A está sendo corrigido. Aguarde a propagação DNS (pode levar alguns minutos) e tente verificar novamente.`,
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

      // DNS verificado, domínio aponta para Lovable DNS - ativar automaticamente
      console.log("[domain-verification] DNS verified, activating domain with Lovable SSL...");
      
      await supabase
        .from("custom_domains")
        .update({
          status: "active",
          ssl_status: "active",
          ssl_provisioned_at: new Date().toISOString(),
        })
        .eq("id", domainId);

      // Send activation notification
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
          message: "DNS verificado e SSL ativado! Seu domínio está pronto para uso.",
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

// Get public A records for a domain using Google DNS
async function getPublicARecords(domain: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
      { headers: { Accept: "application/dns-json" } }
    );

    if (!response.ok) {
      console.log(`[getPublicARecords] DNS query failed for ${domain}`);
      return [];
    }

    const data = await response.json();
    const answers = (data.Answer ?? []) as Array<{ type: number; data: string }>;
    return answers
      .filter((a) => a.type === 1 && typeof a.data === "string")
      .map((a) => a.data.trim());
  } catch (error) {
    console.error(`[getPublicARecords] Error for ${domain}:`, error);
    return [];
  }
}

// Force disable proxy on ALL existing A/AAAA/CNAME records for a hostname
// This is critical to avoid Cloudflare Error 1000 (DNS points to prohibited IP)
async function forceDisableProxyForHostname(zoneId: string, safeToken: string, hostname: string): Promise<void> {
  try {
    // List ALL records for this hostname (not just A records)
    const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${encodeURIComponent(hostname)}`;
    const listRes = await fetch(listUrl, {
      headers: {
        Authorization: `Bearer ${safeToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!listRes.ok) {
      console.log(`[forceDisableProxy] Failed to list records for ${hostname}`);
      return;
    }

    const listData = await listRes.json();
    
    for (const record of listData.result || []) {
      if (record.proxied && (record.type === "A" || record.type === "AAAA" || record.type === "CNAME")) {
        console.log(`[forceDisableProxy] Disabling proxy for ${record.type} ${record.name} -> ${record.content}`);
        await fetch(
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
      }
    }
  } catch (error) {
    console.error(`[forceDisableProxy] Error for ${hostname}:`, error);
  }
}

// Auto-repair Cloudflare DNS records: delete wrong A records and create correct ones
async function autoRepairCloudflareRecords(
  rootDomain: string,
  apiToken: string,
  zoneId: string,
  verificationToken: string
): Promise<void> {
  const cleaned = apiToken.replace(/[^\x20-\x7E]/g, "").trim();
  const safeToken = cleaned.replace(/^Bearer\s+/i, "").replace(/\s+/g, "");

  const recordsToFix = [rootDomain, `www.${rootDomain}`];

  // FIRST: Force disable proxy on ALL records for these hostnames
  // This is critical to prevent Error 1000
  for (const recordName of recordsToFix) {
    await forceDisableProxyForHostname(zoneId, safeToken, recordName);
  }

  for (const recordName of recordsToFix) {
    try {
      // List all A records for this name
      const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${encodeURIComponent(recordName)}`;
      const listRes = await fetch(listUrl, {
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!listRes.ok) {
        console.log(`[autoRepair] Failed to list A records for ${recordName}`);
        continue;
      }

      const listData = await listRes.json();
      let hasCorrectRecord = false;

      // Delete any A record pointing to wrong IP, or disable proxy if needed
      for (const record of listData.result || []) {
        if (record.content === TARGET_IP) {
          hasCorrectRecord = true;
          // Ensure proxy is disabled (double-check)
          if (record.proxied) {
            console.log(`[autoRepair] Disabling proxy for ${recordName}`);
            await fetch(
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
          }
        } else {
          // Wrong IP - delete it
          console.log(`[autoRepair] Deleting wrong A record ${recordName} -> ${record.content}`);
          await fetch(
            `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${safeToken}`,
                "Content-Type": "application/json",
              },
            }
          );
        }
      }

      // Also delete any CNAME or AAAA records that conflict
      const conflictUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${encodeURIComponent(recordName)}`;
      const conflictRes = await fetch(conflictUrl, {
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
      });

      if (conflictRes.ok) {
        const conflictData = await conflictRes.json();
        for (const record of conflictData.result || []) {
          if (record.type === "CNAME" || record.type === "AAAA") {
            console.log(`[autoRepair] Deleting conflicting ${record.type} record for ${recordName}`);
            await fetch(
              `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${safeToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
          }
        }
      }

      // If no correct record exists, create one
      if (!hasCorrectRecord) {
        console.log(`[autoRepair] Creating A record ${recordName} -> ${TARGET_IP}`);
        await fetch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${safeToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "A",
              name: recordName,
              content: TARGET_IP,
              ttl: 300, // Short TTL for faster propagation
              proxied: false, // CRITICAL: DNS-only to avoid Error 1000
            }),
          }
        );
      }
    } catch (error) {
      console.error(`[autoRepair] Error fixing ${recordName}:`, error);
    }
  }

  // Also ensure TXT record exists (supports both the current Lovable format and legacy formats)
  const txtRecordsToCreate = [
    { name: `_lovable.${rootDomain}`, content: `lovable_verify=${verificationToken}` },
    { name: `_lovable.www.${rootDomain}`, content: `lovable_verify=${verificationToken}` },

    // Legacy (keep for backwards compatibility)
    { name: `_acolheaqui.${rootDomain}`, content: `acolheaqui_verify=${verificationToken}` },
    { name: `_acolheaqui.www.${rootDomain}`, content: `acolheaqui_verify=${verificationToken}` },
  ];

  for (const txtRecord of txtRecordsToCreate) {
    try {
      const listUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=TXT&name=${encodeURIComponent(txtRecord.name)}`;
      const listRes = await fetch(listUrl, {
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
      });

      if (listRes.ok) {
        const listData = await listRes.json();
        const existing = listData.result?.find((r: any) => r.content?.includes(verificationToken));

        if (!existing) {
          console.log(`[autoRepair] Creating TXT record ${txtRecord.name}`);
          await fetch(
            `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${safeToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                type: "TXT",
                name: txtRecord.name,
                content: txtRecord.content,
                ttl: 300,
              }),
            }
          );
        }
      }
    } catch (error) {
      console.error(`[autoRepair] Error fixing TXT record ${txtRecord.name}:`, error);
    }
  }

  console.log(`[autoRepair] Completed auto-repair for ${rootDomain}`);
}

async function verifyTxtRecord(domain: string, expectedToken: string): Promise<boolean> {
  const expectedValues = new Set<string>([
    `lovable_verify=${expectedToken}`,
    // Legacy
    `acolheaqui_verify=${expectedToken}`,
  ]);

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
      if (txtValue && expectedValues.has(txtValue)) {
        console.log(`[verifyTxtRecord] TXT record verified for ${fqdn}`);
        return true;
      }
    }

    return false;
  };

  try {
    // Aceita TXT tanto no domínio informado quanto no domínio raiz (ex: www.exemplo.com → exemplo.com).
    // Suporta o padrão atual: _lovable + lovable_verify=...
    // E também um padrão antigo (_acolheaqui + acolheaqui_verify=...) para compatibilidade.
    const candidates = new Set<string>();
    const prefixes = ["_lovable", "_acolheaqui"];

    const root = getRootDomain(domain);
    const hosts = root && root !== domain ? [domain, root] : [domain];

    for (const host of hosts) {
      for (const prefix of prefixes) {
        candidates.add(`${prefix}.${host}`);
      }
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
