import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hostnameId } = await req.json();
    
    const apiToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const zoneId = Deno.env.get("CLOUDFLARE_ZONE_ID");
    
    if (!apiToken || !zoneId) {
      return new Response(
        JSON.stringify({ error: "Missing Cloudflare credentials" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const safeToken = apiToken.replace(/[^\x20-\x7E]/g, "").trim().replace(/^Bearer\s+/i, "").replace(/\s+/g, "");

    // Trigger a refresh/recheck of the custom hostname
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${hostnameId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ssl: {
            method: "http",
            type: "dv"
          }
        })
      }
    );

    const data = await response.json();
    console.log(`[refresh-hostname] Response:`, JSON.stringify(data, null, 2));

    return new Response(
      JSON.stringify({ 
        success: data.success,
        result: data.result ? {
          hostname: data.result.hostname,
          status: data.result.status,
          sslStatus: data.result.ssl?.status,
          verificationErrors: data.result.verification_errors
        } : null,
        errors: data.errors
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[refresh-hostname] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
