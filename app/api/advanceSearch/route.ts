import { NextRequest } from "next/server";
import { ok, err } from "@/utils/response";
import { cacheHeader, CACHE_TTL, withCache } from "@/utils/cache";
import { scrapeAdvanceSearch } from "@/libs/scrapeAdvanceSearch";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    // const data = await scrapeAdvanceSearch(searchParams);
    const data = await withCache(
      `advanceSearch:${[...searchParams.entries()].sort().toString()}`,
      CACHE_TTL.SHORT,
      () => scrapeAdvanceSearch(searchParams),
    );

    return ok(data, {
      headers: { "Cache-Control": cacheHeader(CACHE_TTL.SHORT) },
    });
  } catch (e: any) {
    console.error("[/api/advanceSearch]", e);
    return err(e.message || "Failed to fetch advance search komik");
  }
}
