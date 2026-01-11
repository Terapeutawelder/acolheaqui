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
    const { hostname, action } = await req.json();
    
    const apiToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const zoneId = Deno.env.get("CLOUDFLARE_ZONE_ID");
    
    if (!apiToken || !zoneId) {
      return new Response(
        JSON.stringify({ error: "Missing Cloudflare credentials" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const safeToken = apiToken.replace(/[^\x20-\x7E]/g, "").trim().replace(/^Bearer\s+/i, "").replace(/\s+/g, "");

    // First, find existing hostname
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
    console.log(`[reset-hostname] Existing hostnames:`, JSON.stringify(listData, null, 2));

    const results: any[] = [];

    // Delete existing if action is reset
    if (action === "reset" && listData.result?.length > 0) {
      for (const h of listData.result) {
        console.log(`[reset-hostname] Deleting hostname ${h.id}...`);
        const deleteResponse = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${h.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${safeToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const deleteData = await deleteResponse.json();
        console.log(`[reset-hostname] Delete result:`, JSON.stringify(deleteData, null, 2));
        results.push({ action: "delete", hostname: h.hostname, success: deleteData.success });
      }

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Recreate the hostname
      console.log(`[reset-hostname] Creating new hostname ${hostname}...`);
      const createResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${safeToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hostname: hostname,
            ssl: {
              method: "txt",
              type: "dv",
              settings: {
                min_tls_version: "1.2"
              }
            }
          })
        }
      );
      const createData = await createResponse.json();
      console.log(`[reset-hostname] Create result:`, JSON.stringify(createData, null, 2));
      results.push({ 
        action: "create", 
        hostname: hostname, 
        success: createData.success,
        status: createData.result?.status,
        sslStatus: createData.result?.ssl?.status,
        errors: createData.errors
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[reset-hostname] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
