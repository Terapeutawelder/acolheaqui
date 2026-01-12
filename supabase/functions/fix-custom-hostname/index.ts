import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FixRequest {
  domainId: string;
  action?: "diagnose" | "fix";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cfApiToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const cfZoneId = Deno.env.get("CLOUDFLARE_ZONE_ID");

    if (!cfApiToken || !cfZoneId) {
      return new Response(
        JSON.stringify({ success: false, error: "Cloudflare credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { domainId, action = "fix" } = (await req.json()) as FixRequest;

    if (!domainId) {
      return new Response(
        JSON.stringify({ success: false, error: "domainId é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get domain info
    const { data: domain, error } = await supabase
      .from("custom_domains")
      .select("*")
      .eq("id", domainId)
      .single();

    if (error || !domain) {
      return new Response(
        JSON.stringify({ success: false, error: "Domínio não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const safeToken = cfApiToken.replace(/[^\x20-\x7E]/g, "").trim().replace(/^Bearer\s+/i, "").replace(/\s+/g, "");
    const hostnames = [domain.domain];
    
    // Add www if this is a root domain
    const parts = domain.domain.split(".");
    if (parts.length === 2 || (parts.length === 3 && ["com", "net", "org", "gov", "edu"].includes(parts[parts.length - 2]))) {
      hostnames.push(`www.${domain.domain}`);
    }

    console.log(`[fix-custom-hostname] Processing hostnames: ${hostnames.join(", ")}`);

    const diagnostics: any[] = [];
    const fixes: any[] = [];

    for (const hostname of hostnames) {
      // Step 1: Check existing custom hostname status
      const listUrl = `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames?hostname=${encodeURIComponent(hostname)}`;
      const listRes = await fetch(listUrl, {
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
      });
      const listData = await listRes.json();
      
      console.log(`[fix-custom-hostname] Existing custom hostnames for ${hostname}:`, JSON.stringify(listData.result?.length || 0));

      for (const ch of listData.result || []) {
        const diagnostic = {
          hostname: ch.hostname,
          id: ch.id,
          status: ch.status,
          ssl_status: ch.ssl?.status,
          verification_errors: ch.verification_errors,
          ownership_verification: ch.ownership_verification,
        };
        diagnostics.push(diagnostic);

        if (action === "fix") {
          // If status is pending with CNAME error, delete and recreate
          const hasCnameError = ch.verification_errors?.some((e: string) => 
            e.toLowerCase().includes("cname") || e.toLowerCase().includes("does not")
          );

          if (ch.status === "pending" && hasCnameError) {
            console.log(`[fix-custom-hostname] Deleting problematic hostname ${ch.id} (${ch.hostname})`);
            
            // Delete the hostname
            const deleteRes = await fetch(
              `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames/${ch.id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${safeToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const deleteData = await deleteRes.json();
            console.log(`[fix-custom-hostname] Delete result:`, deleteData.success);

            fixes.push({
              action: "deleted",
              hostname: ch.hostname,
              id: ch.id,
              success: deleteData.success,
            });

            // Wait a bit for deletion to propagate
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Recreate with HTTP validation (doesn't need CNAME)
            console.log(`[fix-custom-hostname] Recreating hostname ${ch.hostname} with HTTP validation`);
            const createRes = await fetch(
              `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${safeToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  hostname: ch.hostname,
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
            const createData = await createRes.json();
            console.log(`[fix-custom-hostname] Create result:`, JSON.stringify(createData, null, 2));

            fixes.push({
              action: "created",
              hostname: ch.hostname,
              success: createData.success,
              status: createData.result?.status,
              ssl_status: createData.result?.ssl?.status,
              errors: createData.errors,
            });
          } else if (ch.status === "active") {
            console.log(`[fix-custom-hostname] Hostname ${ch.hostname} is already active`);
            fixes.push({
              action: "skipped",
              hostname: ch.hostname,
              reason: "already active",
            });
          }
        }
      }

      // If no custom hostname exists, create one
      if ((listData.result || []).length === 0 && action === "fix") {
        console.log(`[fix-custom-hostname] No custom hostname found for ${hostname}, creating...`);
        
        const createRes = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${safeToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hostname: hostname,
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
        const createData = await createRes.json();
        console.log(`[fix-custom-hostname] Create result for ${hostname}:`, JSON.stringify(createData, null, 2));

        fixes.push({
          action: "created_new",
          hostname: hostname,
          success: createData.success,
          status: createData.result?.status,
          ssl_status: createData.result?.ssl?.status,
          errors: createData.errors,
        });
      }
    }

    // Update domain status in database
    if (action === "fix" && fixes.some(f => f.success)) {
      await supabase
        .from("custom_domains")
        .update({
          status: "verifying",
          ssl_status: "provisioning",
          updated_at: new Date().toISOString(),
        })
        .eq("id", domainId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        domain: domain.domain,
        action,
        diagnostics,
        fixes: action === "fix" ? fixes : undefined,
        message: action === "fix" 
          ? "Custom hostnames foram recriados. Aguarde alguns minutos para ativação."
          : "Diagnóstico concluído",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("[fix-custom-hostname] Error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
