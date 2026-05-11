import { fetchAPI } from "@/libs/scraper";
import {
  DetailKomik,
  KomikcastDetailResponse,
  KomikcastRecommendedResponse,
  KomikcastReadChapterResponse,
  RecommendedKomik,
} from "@/types/manga";

export async function scrapeDetailKomik(slug: string) {
  const detailRes: KomikcastDetailResponse = await fetchAPI(
    `/series/${slug}?includeMeta=true`,
  );

  const item = detailRes.data;

  if (!item) {
    throw new Error("Komik not found");
  }

  const format = item.data.format || "manga";
  const genreIds = (item.data.genreIds || []).join("%2C");
  const recommendedUrl = `/series?take=8&genreIds=${genreIds}&format=${format}`;
  const chaptersUrl = `/series/${slug}/chapters`;

  const [recRes, chapRes] = await Promise.all([
    fetchAPI(recommendedUrl) as Promise<KomikcastRecommendedResponse>,
    fetchAPI(chaptersUrl) as Promise<KomikcastReadChapterResponse>,
  ]);

  const recommended: RecommendedKomik[] = recRes.data.map((rec) => ({
    cover: rec.data.coverImage,
    title: rec.data.title,
    nativeTitle: rec.data.nativeTitle || "",
    slug: rec.data.slug,
    author: rec.data.author || "",
    rating: rec.data.rating?.toString() || "0",
    status: rec.data.status || "",
    format: rec.data.format || "",
    type: rec.data.type || "",
    isHot: rec.data.isHot,
    totalChapters: rec.data.totalChapters || "0",
  }));

  const detail: DetailKomik = {
    title: item.data.title,
    slug: item.data.slug,
    cover: item.data.coverImage,
    backgroundImage: item.data.backgroundImage || "",
    rating: item.data.rating?.toString() || "0",
    type: item.data.type || "",
    isHot: item.data.isHot,
    isRecommended: item.data.isRecommended,
    isAnimeAdapted: item.data.animeAdaptation,
    author: item.data.author || "",
    format: item.data.format || "",
    nativeTitle: item.data.nativeTitle || "",
    releaseDate: item.data.releaseDate || "",
    synopsis: item.data.synopsis || "",
    totalChapters: item.data.totalChapters || "0",
    status: item.data.status || "",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    genres: (item.data.genres || []).map((g) => ({
      id: g.id,
      data: {
        name: g.data.name,
        description: g.data.description,
      },
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    })),
    readChapter: (chapRes.data || []).map((ch) => ({
      id: ch.id,
      chapterIndex: ch.data.index,
      slug: ch.data.slug,
      title: ch.data.title,
      createdAt: ch.createdAt,
      updatedAt: ch.updatedAt,
    })),
    recommended,
  };

  return detail;
}
