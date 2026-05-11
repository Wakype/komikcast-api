import { NextRequest } from "next/server";
import { scrapePopular } from "@/libs/scrapePopular";
import { ok, err } from "@/utils/response";
import { cacheHeader, CACHE_TTL } from "@/utils/cache";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const take = Number.parseInt(searchParams.get("take") || "10", 10) || 10;
    const page = Number.parseInt(searchParams.get("page") || "1", 10) || 1;

    if (!category) {
      return err(
        "Missing category parameter. Allowed: best-manhwa, best-manhua, best-manga, anime-adaptations, trending",
        400,
      );
    }

    const data = await scrapePopular(category, take, page);

    return ok(data, {
      headers: { "Cache-Control": cacheHeader(CACHE_TTL.SHORT) },
    });
  } catch (e: any) {
    console.error("[/api/popular]", e);
    return err(e.message || "Failed to fetch popular komik");
  }
}
