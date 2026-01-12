import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const cfApiToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const cfZoneId = Deno.env.get("CLOUDFLARE_ZONE_ID");

    if (!cfApiToken || !cfZoneId) {
      return new Response(
        JSON.stringify({ success: false, error: "Cloudflare credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const safeToken = cfApiToken.replace(/[^\x20-\x7E]/g, "").trim().replace(/^Bearer\s+/i, "").replace(/\s+/g, "");

    // Get zone details
    const zoneRes = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${cfZoneId}`,
      {
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const zoneData = await zoneRes.json();
    console.log("[get-cf-zone-info] Zone data:", JSON.stringify(zoneData, null, 2));

    // Get fallback origin
    const fallbackRes = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames/fallback_origin`,
      {
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const fallbackData = await fallbackRes.json();
    console.log("[get-cf-zone-info] Fallback origin:", JSON.stringify(fallbackData, null, 2));

    // Get custom hostname settings
    const settingsRes = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/ssl/universal/settings`,
      {
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const settingsData = await settingsRes.json();
    console.log("[get-cf-zone-info] SSL settings:", JSON.stringify(settingsData, null, 2));

    // List some DNS records for the zone
    const dnsRes = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/dns_records?per_page=20`,
      {
        headers: {
          Authorization: `Bearer ${safeToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const dnsData = await dnsRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        zone: zoneData.result ? {
          id: zoneData.result.id,
          name: zoneData.result.name,
          status: zoneData.result.status,
          name_servers: zoneData.result.name_servers,
        } : null,
        fallback_origin: fallbackData.result,
        ssl_settings: settingsData.result,
        dns_records: (dnsData.result || []).map((r: any) => ({
          type: r.type,
          name: r.name,
          content: r.content,
          proxied: r.proxied,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("[get-cf-zone-info] Error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
