import { fetchAPI } from "@/libs/scraper";
import {
  PopularCategoryItem,
  PopularCategoryResponse,
  KomikcastMeta,
} from "@/types/manga";

export async function scrapePopular(
  category: string,
  take: number = 10,
  page: number = 1,
): Promise<{ data: PopularCategoryItem[]; meta: KomikcastMeta }> {
  const allowedCategories = [
    "best-manhwa",
    "best-manhua",
    "best-manga",
    "anime-adaptations",
    "trending",
  ];

  if (!allowedCategories.includes(category)) {
    throw new Error(
      `Invalid category. Allowed categories are: ${allowedCategories.join(", ")}`,
    );
  }

  const res: PopularCategoryResponse = await fetchAPI(
    `/series/${category}?take=${take}&page=${page}`,
  );

  if (!res.data || !Array.isArray(res.data)) {
    throw new Error(`Failed to fetch popular komik for category: ${category}`);
  }

  const data: PopularCategoryItem[] = res.data.map((item) => ({
    id: item.id,
    data: {
      slug: item.data.slug,
      type: item.data.type || "",
      isHot: item.data.isHot,
      title: item.data.title,
      author: item.data.author || "",
      format: item.data.format || "",
      rating: item.data.rating || 0,
      status: item.data.status || "",
      genreIds: item.data.genreIds || [],
      coverImage: item.data.coverImage,
      animeStatus: item.data.animeStatus || null,
      nativeTitle: item.data.nativeTitle || "",
      totalChapters: item.data.totalChapters || "0",
      animeAdaptation: item.data.animeAdaptation || false,
      backgroundImage: item.data.backgroundImage || "",
      genres: (item.data.genres || []).map((g) => ({
        id: g.id,
        data: {
          name: g.data.name,
          description: g.data.description,
        },
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      })),
    },
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    weightedScore: item.weightedScore || null,
    priorityScore: item.priorityScore || null,
  }));

  const meta = res.meta || {
    total: data.length,
    page: page,
    lastPage: 1,
    take: take,
  };

  return { data, meta };
}
