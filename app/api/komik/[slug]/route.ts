import { NextRequest } from "next/server";
import { ok, err } from "@/utils/response";
import { cacheHeader, CACHE_TTL } from "@/utils/cache";
import { scrapeDetailKomik } from "@/libs/scrapeDetailKomik";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const data = await scrapeDetailKomik(slug);

    return ok(data, {
      headers: { "Cache-Control": cacheHeader(CACHE_TTL.MEDIUM) },
    });
  } catch (e: any) {
    console.error("[/api/komik/[slug]]", e);
    return err(e.message || "Failed to fetch komik detail");
  }
}
