import * as cheerio from "cheerio";

const BASE_URL = process.env.MANGA_BASE_URL!;

const defaultHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  Referer: BASE_URL,
  Origin: BASE_URL.replace(/\/$/, ""),
};

function getUrl(path: string) {
  return `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function fetchAPI(path: string) {
  const url = getUrl(path);
  const response = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    cache: "no-store", // Don't use Next.js fetch cache for the scraper itself
  });

  if (!response.ok) {
    throw new Error(`fetchAPI failed with status ${response.status} for ${url}`);
  }

  return response.json();
}

export async function fetchPage(path: string) {
  const url = getUrl(path);
  const response = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`fetchPage failed with status ${response.status} for ${url}`);
  }

  const html = await response.text();
  return cheerio.load(html);
}
