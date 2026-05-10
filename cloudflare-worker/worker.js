/* eslint-disable import/no-anonymous-default-export */
/**
 * Cloudflare Worker Proxy for Komikcast API
 *
 * This worker proxies requests to the target manga site from within
 * Cloudflare's network. Since Workers run on Cloudflare's edge,
 * they have trusted IPs and won't be challenged by Cloudflare's
 * bot protection on the target site.
 *
 * Deploy this worker to your Cloudflare account (free tier: 100K req/day).
 *
 * Usage: GET https://your-worker.workers.dev/?url=<encoded target url>
 */

const ALLOWED_ORIGINS = [
  "https://komikcast-api-six.vercel.app",
  "http://localhost:3000",
];

const TARGET_HOST = "be.komikcast.cc";

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(request),
      });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: "Missing ?url= parameter" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Security: Only allow proxying to the target host
    try {
      const parsed = new URL(targetUrl);
      if (parsed.hostname !== TARGET_HOST) {
        return new Response(
          JSON.stringify({ error: "Target host not allowed" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
          Referer: "https://be.komikcast.cc/",
          Origin: "https://be.komikcast.cc",
        },
      });

      // Clone the response and add CORS headers
      const body = await response.arrayBuffer();
      const responseHeaders = new Headers(response.headers);

      // Add CORS headers
      const cors = corsHeaders(request);
      for (const [key, value] of Object.entries(cors)) {
        responseHeaders.set(key, value);
      }

      // Cache successful responses on Cloudflare's edge for 5 minutes
      if (response.ok) {
        responseHeaders.set("Cache-Control", "public, max-age=300");
      }

      return new Response(body, {
        status: response.status,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Proxy fetch failed", detail: err.message }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(request),
          },
        },
      );
    }
  },
};

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
