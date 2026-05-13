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
 *
 * Environment Variables (set in Worker Settings → Variables):
 *   - BYPASS_SECRET: A secret key that allows unlimited access (no rate limit)
 *
 * To bypass rate limit, send the secret as a header:
 *   X-Bypass-Key: <your BYPASS_SECRET value>
 */

// ─── Configuration ──────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  // Add your own Vercel deployment URL here, e.g.:
  // "https://your-project.vercel.app",
  "https://komikcast-api-six.vercel.app",
  "http://localhost:3000",
];

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
];

const TARGET_HOST = "be.komikcast.cc";

// Rate limit: max requests per window per IP
const RATE_LIMIT_MAX = 60; // max 60 requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // per 1 minute

// ─── In-memory rate limit store (per Worker isolate) ────────────
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Clean up old entries periodically (every 100 checks)
  if (Math.random() < 0.01) {
    for (const [key, val] of rateLimitMap) {
      if (now - val.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // New window
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}

// ─── Main Handler ───────────────────────────────────────────────
export default {
  async fetch(request, env) {
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
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(request),
          },
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
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders(request),
            },
          },
        );
      }
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(request),
        },
      });
    }

    // ─── Bypass check (secret key from header) ──────────────
    const bypassKey = request.headers.get("X-Bypass-Key");
    const hasValidBypass =
      env.BYPASS_SECRET && bypassKey && bypassKey === env.BYPASS_SECRET;

    // ─── Rate limiting (skip if bypass is valid) ────────────
    if (!hasValidBypass) {
      const clientIp =
        request.headers.get("CF-Connecting-IP") ||
        request.headers.get("X-Forwarded-For") ||
        "unknown";

      if (isRateLimited(clientIp)) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded",
            message: `Max ${RATE_LIMIT_MAX} requests per minute. Please slow down.`,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "60",
              ...corsHeaders(request),
            },
          },
        );
      }
    }

    // ─── Proxy the request ──────────────────────────────────
    try {
      const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent": ua,
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

// ─── CORS Helper ────────────────────────────────────────────────
function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Bypass-Key",
    "Access-Control-Max-Age": "86400",
  };
}
