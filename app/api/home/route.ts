import { NextRequest } from "next/server";
import { ok, err } from "@/utils/response";
import { cacheHeader, CACHE_TTL, withCache } from "@/utils/cache";
import { scrapeHome } from "@/libs/scrapeHome";

export async function GET(req: NextRequest) {
  try {
    // const data = await scrapeHome();
    const data = await withCache("home", CACHE_TTL.SHORT, () => scrapeHome());

    return ok(data, {
      headers: { "Cache-Control": cacheHeader(CACHE_TTL.SHORT) },
    });
  } catch (e) {
    console.error("[/api/home]", e);
    return err("Failed to fetch home data");
  }
}
