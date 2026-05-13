import * as cheerio from "cheerio";

const BASE_URL = process.env.MANGA_BASE_URL!;
const BYPASS_SECRET = process.env.BYPASS_SECRET;

const PROXY_URLS: string[] = [
  process.env.SCRAPER_PROXY_URL,
  process.env.SCRAPER_PROXY_URL_2,
  process.env.SCRAPER_PROXY_URL_3,
].filter((url): url is string => typeof url === "string" && url.length > 0);

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
 * Try fetching via a specific proxy URL.
 * Returns the Response, or throws if failed.
 */
async function fetchViaProxy(
  proxyUrl: string,
  directUrl: string,
): Promise<Response> {
  const url = `${proxyUrl.replace(/\/$/, "")}/?url=${encodeURIComponent(directUrl)}`;
  const headers: Record<string, string> = {};

  if (BYPASS_SECRET) {
    headers["X-Bypass-Key"] = BYPASS_SECRET;
  }

  const response = await fetch(url, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Proxy fetch failed with status ${response.status} for ${directUrl}`,
    );
  }

  return response;
}

/**
 * Fetch raw data from the target site.
 * - If multiple SCRAPER_PROXY_URL_* are set, tries a random one first,
 *   then falls back to the others before giving up.
 * - If no proxy is configured, fetches directly (works locally).
 */
async function rawFetch(path: string): Promise<Response> {
  const directUrl = getDirectUrl(path);

  if (PROXY_URLS.length > 0) {
    // Shuffle proxy list so each request tries a different order
    const shuffled = [...PROXY_URLS].sort(() => Math.random() - 0.5);

    let lastError: Error | null = null;

    for (const proxyUrl of shuffled) {
      try {
        const response = await fetchViaProxy(proxyUrl, directUrl);
        return response;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(
          `[scraper] Proxy ${proxyUrl} failed for ${directUrl}: ${lastError.message}. Trying next...`,
        );
      }
    }

    // All proxies failed
    throw lastError ?? new Error(`All proxies failed for ${directUrl}`);
  }

  // Direct fetch (works locally, blocked on Vercel by Cloudflare)
  const response = await fetch(directUrl, {
    method: "GET",
    headers: defaultHeaders,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Direct fetch failed with status ${response.status} for ${directUrl}`,
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
