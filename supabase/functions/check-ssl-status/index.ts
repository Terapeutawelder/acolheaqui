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
    const { hostname } = await req.json();
    
    const apiToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const zoneId = Deno.env.get("CLOUDFLARE_ZONE_ID");
    
    if (!apiToken || !zoneId) {
      return new Response(
        JSON.stringify({ error: "Missing Cloudflare credentials" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Clean token
    const safeToken = apiToken.replace(/[^\x20-\x7E]/g, "").trim().replace(/^Bearer\s+/i, "").replace(/\s+/g, "");

    // List all custom hostnames
    const listResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames?hostname=${encodeURIComponent(hostname)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const listData = await listResponse.json();
    console.log(`[check-ssl-status] Custom hostnames for ${hostname}:`, JSON.stringify(listData, null, 2));

    if (!listData.success) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch custom hostnames", 
          details: listData.errors 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get detailed info for each hostname
    const hostnames = listData.result || [];
    const detailedHostnames = [];

    for (const h of hostnames) {
      const detailResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${h.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${safeToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const detailData = await detailResponse.json();
      if (detailData.success) {
        detailedHostnames.push(detailData.result);
      }
    }

    // Also check www subdomain
    const wwwResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames?hostname=www.${hostname}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const wwwData = await wwwResponse.json();
    console.log(`[check-ssl-status] Custom hostnames for www.${hostname}:`, JSON.stringify(wwwData, null, 2));

    if (wwwData.success && wwwData.result?.length > 0) {
      for (const h of wwwData.result) {
        const detailResponse = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${h.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${safeToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const detailData = await detailResponse.json();
        if (detailData.success) {
          detailedHostnames.push(detailData.result);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        hostname,
        customHostnames: detailedHostnames,
        summary: detailedHostnames.map(h => ({
          hostname: h.hostname,
          status: h.status,
          sslStatus: h.ssl?.status,
          sslMethod: h.ssl?.method,
          sslType: h.ssl?.type,
          certificateAuthority: h.ssl?.certificate_authority,
          validationErrors: h.ssl?.validation_errors,
          ownershipVerification: h.ownership_verification,
          createdAt: h.created_at
        }))
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[check-ssl-status] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
