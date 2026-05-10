import { fetchAPI } from "@/libs/scraper";
import { KomikcastGenre, KomikcastGenresResponse } from "@/types/manga";

export async function scrapeGenres(): Promise<KomikcastGenre[]> {
  const res: KomikcastGenresResponse = await fetchAPI("/genres");

  if (!res.data || !Array.isArray(res.data)) {
    throw new Error("Failed to fetch genres");
  }

  return res.data.map((item) => ({
    id: item.id,
    data: {
      name: item.data.name,
      description: item.data.description || "",
    },
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}
