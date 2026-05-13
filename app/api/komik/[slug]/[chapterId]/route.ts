import { NextRequest } from "next/server";
import { ok, err } from "@/utils/response";
import { cacheHeader, CACHE_TTL, withCache } from "@/utils/cache";
import { scrapeReadChapter } from "@/libs/scrapeReadChapter";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; chapterId: string }> },
) {
  try {
    const { slug, chapterId } = await params;
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    // const data = await scrapeReadChapter(slug, chapterId, baseUrl);
    const data = await withCache(
      `chapter:${slug}:${chapterId}`,
      CACHE_TTL.STATIC,
      () => scrapeReadChapter(slug, chapterId, baseUrl),
    );

    return ok(data, {
      headers: { "Cache-Control": cacheHeader(CACHE_TTL.STATIC) },
    });
  } catch (e: any) {
    console.error("[/api/komik/[slug]/[chapterId]]", e);
    return err(e.message || "Failed to fetch chapter content");
  }
}
