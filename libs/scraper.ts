import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = process.env.MANGA_BASE_URL!;

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: BASE_URL,
  },
});

export async function fetchAPI(path: string) {
  const { data } = await client.get(path);
  return data;
}

export async function fetchPage(path: string) {
  const { data } = await client.get(path);
  return cheerio.load(data);
}
