import { fetchAPI } from "@/libs/scraper";
import {
  HeroKomik,
  PopularKomik,
  NewestKomik,
  KomikcastBannerResponse,
  KomikcastPopularResponse,
  KomikcastNewestResponse,
  KomikcastSeriesItem,
} from "@/types/manga";

export async function scrapeHome() {
  const [bannerResponse, popularResponse, newestResponse] = await Promise.all([
    fetchAPI(
      "/series?preset=banner&includeMeta=true",
    ) as Promise<KomikcastBannerResponse>,
    fetchAPI(
      "/series?preset=popular_all&take=10&takeChapter=2&includeMeta=true",
    ) as Promise<KomikcastPopularResponse>,
    fetchAPI(
      "/series?preset=rilisan_terbaru&take=20&takeChapter=3&page=1",
    ) as Promise<KomikcastNewestResponse>,
  ]);

  const hero: HeroKomik[] = bannerResponse.data.map(
    (item: KomikcastSeriesItem) => ({
      title: item.data.title,
      nativeTitle: item.data.nativeTitle || "",
      author: item.data.author || "",
      slug: item.data.slug,
      format: item.data.format || "",
      backgroundImage: item.data.backgroundImage || "",
      cover: item.data.coverImage,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }),
  );

  const popular: PopularKomik[] = popularResponse.data.map(
    (item: KomikcastSeriesItem) => ({
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
    }),
  );

  const newest: NewestKomik[] = newestResponse.data.map(
    (item: KomikcastSeriesItem) => ({
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
    }),
  );

  return { hero, popular, newest };
}
