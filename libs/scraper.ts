import * as cheerio from "cheerio";

const BASE_URL = process.env.MANGA_BASE_URL!;
// Optional: URL of the Cloudflare Worker proxy
// e.g., "https://your-worker.your-subdomain.workers.dev"
const PROXY_URL = process.env.SCRAPER_PROXY_URL;

const defaultHeaders: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Sec-Ch-Ua":
    '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  Referer: BASE_URL,
  Origin: BASE_URL.replace(/\/$/, ""),
};

function getDirectUrl(path: string) {
  return `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

/**
 * Fetch raw data from the target site.
 * If SCRAPER_PROXY_URL is set, routes the request through the Cloudflare Worker proxy.
 * Otherwise, fetches directly (works locally, blocked on Vercel by Cloudflare).
 */
async function rawFetch(path: string): Promise<Response> {
  const directUrl = getDirectUrl(path);

  if (PROXY_URL) {
    // Route through Cloudflare Worker proxy
    const proxyUrl = `${PROXY_URL.replace(/\/$/, "")}/?url=${encodeURIComponent(directUrl)}`;
    const response = await fetch(proxyUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(
        `Proxy fetch failed with status ${response.status} for ${directUrl}`
      );
    }
    return response;
  }

  // Direct fetch (works locally)
  const response = await fetch(directUrl, {
    method: "GET",
    headers: defaultHeaders,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Direct fetch failed with status ${response.status} for ${directUrl}`
    );
  }
  return response;
}

export async function fetchAPI(path: string) {
  const response = await rawFetch(path);
  return response.json();
}

export async function fetchPage(path: string) {
  const response = await rawFetch(path);
  const html = await response.text();
  return cheerio.load(html);
}
