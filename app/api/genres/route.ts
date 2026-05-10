import { NextRequest } from "next/server";
import { ok, err } from "@/utils/response";
import { cacheHeader, CACHE_TTL } from "@/utils/cache";
import { scrapeGenres } from "@/libs/scrapeGenres";

export async function GET(req: NextRequest) {
  try {
    const data = await scrapeGenres();

    return ok(data, {
      // Genres rarely change, can be cached longer
      headers: { "Cache-Control": cacheHeader(CACHE_TTL.STATIC) },
    });
  } catch (e: any) {
    console.error("[/api/genres]", e);
    return err(e.message || "Failed to fetch genres");
  }
}
