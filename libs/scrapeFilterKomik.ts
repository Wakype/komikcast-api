import { fetchAPI } from "@/libs/scraper";
import {
  FilterKomik,
  KomikcastFilterResponse,
  PaginatedResponse,
} from "@/types/manga";

export async function scrapeFilterKomik(
  searchParams: URLSearchParams,
): Promise<PaginatedResponse<FilterKomik>> {
  // Transformation for search
  const search = searchParams.get("search");
  if (search) {
    const filterStr = `title=like="${search}",nativeTitle=like="${search}"`;
    searchParams.set("filter", filterStr);
    searchParams.delete("search");
  }

  // Transformation for genreIds, status, format (comma-separated string to multiple params)
  const arrayParams = ["genreIds", "status", "format"];
  arrayParams.forEach((key) => {
    const vals = searchParams.getAll(key);
    if (vals.length > 0) {
      searchParams.delete(key);
      vals.forEach((val) => {
        val.split(",").forEach((v) => {
          if (v.trim()) searchParams.append(key, v.trim());
        });
      });
    }
  });

  // Add default parameters if not provided
  if (!searchParams.has("takeChapter")) searchParams.set("takeChapter", "3");
  if (!searchParams.has("includeMeta"))
    searchParams.set("includeMeta", "false");
  if (!searchParams.has("sort")) searchParams.set("sort", "latest");
  if (!searchParams.has("sortOrder")) searchParams.set("sortOrder", "desc");
  if (!searchParams.has("take")) searchParams.set("take", "12");
  if (!searchParams.has("page")) searchParams.set("page", "1");

  const queryParams = searchParams.toString();
  const res: KomikcastFilterResponse = await fetchAPI(`/series?${queryParams}`);

  if (!res.data || !Array.isArray(res.data)) {
    throw new Error("Failed to fetch filter komik");
  }

  const data: FilterKomik[] = res.data.map((item) => ({
    title: item.data.title,
    nativeTitle: item.data.nativeTitle || "",
    slug: item.data.slug,
    synopsis: item.data.synopsis,
    cover: item.data.coverImage,
    backgroundImage: item.data.backgroundImage || "",
    rating: item.data.rating?.toString() || "0",
    type: item.data.type || "",
    isHot: item.data.isHot,
    isRecommended: item.data.isRecommended,
    author: item.data.author || "",
    format: item.data.format || "",
    releaseDate: item.data.releaseDate || "",
    status: item.data.status || "",
    totalChapters: item.data.totalChapters || "0",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    chapters: (item.chapters || []).map((ch) => ({
      chapterIndex: ch.chapterIndex || 0,
      updatedAt: ch.updatedAt,
      createdAt: ch.createdAt,
    })),
    genres: item.data.genres || [],
  }));

  const page = res.meta?.page || 1;
  const lastPage = res.meta?.lastPage || 1;

  return {
    page,
    hasNextPage: page < lastPage,
    data,
  };
}
