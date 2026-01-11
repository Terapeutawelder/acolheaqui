import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetRequest {
  domainId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cfApiToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const cfZoneId = Deno.env.get("CLOUDFLARE_ZONE_ID");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { domainId } = (await req.json()) as ResetRequest;
    if (!domainId) {
      return new Response(JSON.stringify({ success: false, error: "domainId é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    console.log(`[reset-custom-hostname] Processing domain: ${domain.domain}`);

    // Try to delete the custom hostname from Cloudflare SSL for SaaS
    if (cfApiToken && cfZoneId) {
      try {
        // List custom hostnames matching this domain
        const listUrl = `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames?hostname=${encodeURIComponent(domain.domain)}`;
        const listRes = await fetch(listUrl, {
          headers: {
            Authorization: `Bearer ${cfApiToken}`,
            "Content-Type": "application/json",
          },
        });
        const listData = await listRes.json();
        
        console.log(`[reset-custom-hostname] Found ${listData.result?.length || 0} custom hostnames for ${domain.domain}`);

        // Delete all matching custom hostnames
        for (const hostname of listData.result || []) {
          console.log(`[reset-custom-hostname] Deleting custom hostname: ${hostname.id} (${hostname.hostname})`);
          const deleteUrl = `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames/${hostname.id}`;
          const deleteRes = await fetch(deleteUrl, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${cfApiToken}`,
              "Content-Type": "application/json",
            },
          });
          const deleteData = await deleteRes.json();
          console.log(`[reset-custom-hostname] Delete result:`, deleteData.success ? "OK" : deleteData.errors);
        }

        // Also check for www subdomain
        const wwwDomain = `www.${domain.domain}`;
        const wwwListUrl = `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames?hostname=${encodeURIComponent(wwwDomain)}`;
        const wwwListRes = await fetch(wwwListUrl, {
          headers: {
            Authorization: `Bearer ${cfApiToken}`,
            "Content-Type": "application/json",
          },
        });
        const wwwListData = await wwwListRes.json();

        for (const hostname of wwwListData.result || []) {
          console.log(`[reset-custom-hostname] Deleting www custom hostname: ${hostname.id}`);
          const deleteUrl = `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames/${hostname.id}`;
          await fetch(deleteUrl, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${cfApiToken}`,
              "Content-Type": "application/json",
            },
          });
        }

      } catch (cfError) {
        console.error(`[reset-custom-hostname] Cloudflare error:`, cfError);
      }
    }

    // Reset domain status in database
    const { error: updateError } = await supabase
      .from("custom_domains")
      .update({
        status: "pending",
        ssl_status: "pending",
        dns_verified: false,
        dns_verified_at: null,
        ssl_provisioned_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", domainId);

    if (updateError) {
      console.error(`[reset-custom-hostname] Update error:`, updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao atualizar domínio" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Custom hostname removido e status resetado. Configure o DNS corretamente e verifique novamente." 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("[reset-custom-hostname] Error:", errorMessage);
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
