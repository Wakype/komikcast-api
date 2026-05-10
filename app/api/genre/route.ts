import { NextRequest } from "next/server";
import { fetchPage } from "@/libs/scraper";
import { ok, err } from "@/utils/response";
import { cacheHeader, CACHE_TTL } from "@/utils/cache";

export async function GET(req: NextRequest) {
  try {
    // TODO: implement scraping
    return ok(null, {
      headers: { "Cache-Control": cacheHeader(CACHE_TTL.LONG) },
    });
  } catch (e) {
    console.error(e);
    return err("Not implemented");
  }
}
