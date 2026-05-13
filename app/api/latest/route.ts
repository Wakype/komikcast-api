import { NextRequest } from "next/server";
import { ok, err } from "@/utils/response";
import { cacheHeader, CACHE_TTL, withCache } from "@/utils/cache";
import { scrapeLatest } from "@/libs/scrapeLatest";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get("page") || "1", 10) || 1;

    // const data = await scrapeLatest(page);
    const data = await withCache(`latest:${page}`, CACHE_TTL.SHORT, () =>
      scrapeLatest(page),
    );

    return ok(data, {
      headers: { "Cache-Control": cacheHeader(CACHE_TTL.SHORT) },
    });
  } catch (e: any) {
    console.error("[/api/latest]", e);
    return err(e.message || "Failed to fetch latest komik");
  }
}
