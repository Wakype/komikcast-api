import { NextRequest, NextResponse } from "next/server";

// ─── Configuration ──────────────────────────────────────────────
const RATE_LIMIT_MAX = 60; // max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// ─── In-memory rate limit store ─────────────────────────────────
// Note: On Vercel Edge, each isolate has its own memory.
// This provides basic protection, not 100% perfect distributed rate limiting.
// For stricter enforcement, use Upstash Redis (free tier available).
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): {
  limited: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, val] of rateLimitMap) {
      if (now - val.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return {
      limited: false,
      remaining: RATE_LIMIT_MAX - 1,
      resetIn: RATE_LIMIT_WINDOW_MS,
    };
  }

  entry.count++;
  const resetIn = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);

  if (entry.count > RATE_LIMIT_MAX) {
    return { limited: true, remaining: 0, resetIn };
  }

  return { limited: false, remaining: RATE_LIMIT_MAX - entry.count, resetIn };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate-limit API routes (not frontend pages, not the proxy)
  if (!pathname.startsWith("/api/") || pathname.startsWith("/api/proxy")) {
    return NextResponse.next();
  }

  // ─── Bypass: check X-API-Key header ───────────────────────
  const bypassSecret = process.env.BYPASS_SECRET;
  const apiKey = request.headers.get("X-API-Key");

  if (bypassSecret && apiKey && apiKey === bypassSecret) {
    // Valid bypass key → skip rate limit
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Bypass", "true");
    return response;
  }

  // ─── Rate limit by IP ─────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { limited, remaining, resetIn } = isRateLimited(ip);

  if (limited) {
    return NextResponse.json(
      {
        status: 429,
        message: "Rate limit exceeded. Please slow down.",
        retryAfter: Math.ceil(resetIn / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(resetIn / 1000)),
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  // Pass through with rate limit headers
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  return response;
}

// Only run middleware on API routes
export const config = {
  matcher: "/api/:path*",
};
