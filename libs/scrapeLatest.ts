import { fetchAPI } from "@/libs/scraper";
import {
  NewestKomik,
  KomikcastNewestResponse,
  KomikcastMeta,
  KomikcastSeriesItem,
} from "@/types/manga";

export async function scrapeLatest(
  page: number = 1,
): Promise<{ data: NewestKomik[]; meta: KomikcastMeta }> {
  const res: KomikcastNewestResponse = await fetchAPI(
    `/series?preset=rilisan_terbaru&take=20&takeChapter=3&page=${page}`,
  );

  if (!res.data || !Array.isArray(res.data)) {
    throw new Error("Failed to fetch latest komik");
  }

  const data: NewestKomik[] = res.data.map((item: KomikcastSeriesItem) => ({
    title: item.data.title,
    slug: item.data.slug,
    cover: item.data.coverImage,
    backgroundImage: item.data.backgroundImage || "",
    rating: item.data.rating?.toString() || "0",
    type: item.data.type || "",
    isHot: item.data.isHot,
    isRecommended: item.data.isRecommended,
    chapters: (item.chapters || []).map((ch) => ({
      chapterIndex: ch.chapterIndex,
      createdAt: ch.createdAt,
      updatedAt: ch.updatedAt,
    })),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    author: item.data.author || "",
    format: item.data.format || "",
    nativeTitle: item.data.nativeTitle || "",
    releaseDate: item.data.releaseDate || "",
    genres: (item.data.genres || []).map((g) => ({
      id: g.id,
      data: {
        name: g.data.name,
        description: g.data.description,
      },
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    })),
  }));

  const meta = res.meta || {
    total: data.length,
    page: page,
    lastPage: 1,
  };

  return { data, meta };
}
