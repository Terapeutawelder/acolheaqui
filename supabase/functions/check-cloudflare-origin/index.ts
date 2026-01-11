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
    const apiToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const zoneId = Deno.env.get("CLOUDFLARE_ZONE_ID");
    
    if (!apiToken || !zoneId) {
      return new Response(
        JSON.stringify({ error: "Missing Cloudflare credentials" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const safeToken = apiToken.replace(/[^\x20-\x7E]/g, "").trim().replace(/^Bearer\s+/i, "").replace(/\s+/g, "");

    // Get zone details
    const zoneResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const zoneData = await zoneResponse.json();

    // Get fallback origin
    const fallbackResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/fallback_origin`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const fallbackData = await fallbackResponse.json();

    // Get all custom hostnames
    const hostnamesResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames?per_page=50`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const hostnamesData = await hostnamesResponse.json();

    console.log("[check-cloudflare-origin] Zone:", JSON.stringify(zoneData, null, 2));
    console.log("[check-cloudflare-origin] Fallback:", JSON.stringify(fallbackData, null, 2));
    console.log("[check-cloudflare-origin] Hostnames:", JSON.stringify(hostnamesData, null, 2));

    return new Response(
      JSON.stringify({ 
        success: true, 
        zone: zoneData.success ? {
          id: zoneData.result.id,
          name: zoneData.result.name,
          status: zoneData.result.status,
          name_servers: zoneData.result.name_servers
        } : null,
        fallbackOrigin: fallbackData.result,
        customHostnamesCount: hostnamesData.result?.length || 0,
        customHostnames: (hostnamesData.result || []).map((h: any) => ({
          hostname: h.hostname,
          status: h.status,
          sslStatus: h.ssl?.status,
          verificationErrors: h.verification_errors
        }))
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[check-cloudflare-origin] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
