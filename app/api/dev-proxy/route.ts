import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const targetUrl = req.nextUrl.searchParams.get("url");
  if (!targetUrl) return new Response("Missing url parameter", { status: 400 });

  const PROXY_URL = process.env.SCRAPER_PROXY_URL;
  const BYPASS_SECRET = process.env.BYPASS_SECRET;

  try {
    let response: Response;
    if (PROXY_URL) {
      const proxyUrl = `${PROXY_URL.replace(/\/$/, "")}/?url=${encodeURIComponent(targetUrl)}`;
      const proxyHeaders: Record<string, string> = {};
      if (BYPASS_SECRET) {
        proxyHeaders["X-Bypass-Key"] = BYPASS_SECRET;
      }
      response = await fetch(proxyUrl, { headers: proxyHeaders, cache: "no-store" });
    } else {
      response = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
        cache: "no-store",
      });
    }

    if (!response.ok) {
      return new Response(`Failed with status ${response.status}`, {
        status: response.status,
      });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (e: any) {
    console.error("[/api/dev-proxy]", e);
    return new Response(e.message || "Failed to fetch from dev proxy", {
      status: 500,
    });
  }
}
