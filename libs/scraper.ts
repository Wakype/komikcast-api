import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = process.env.MANGA_BASE_URL!;

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
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
