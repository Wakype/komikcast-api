import { NextRequest } from "next/server";
import { ok, err } from "@/utils/response";
import { cacheHeader, CACHE_TTL } from "@/utils/cache";
import { scrapeFilterKomik } from "@/libs/scrapeFilterKomik";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const data = await scrapeFilterKomik(searchParams);

    return ok(data, {
      headers: { "Cache-Control": cacheHeader(CACHE_TTL.SHORT) },
    });
  } catch (e: any) {
    console.error("[/api/filter]", e);
    return err(e.message || "Failed to fetch filter komik");
  }
}
