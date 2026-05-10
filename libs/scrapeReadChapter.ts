import { fetchAPI } from "@/libs/scraper";
import { 
  ReadChapterContent,
  KomikcastChapterContentResponse,
  KomikcastDetailResponse,
  KomikcastReadChapterResponse
} from "@/types/manga";

export async function scrapeReadChapter(slug: string, chapterId: string, baseUrl: string) {
  const [contentRes, detailRes, chapListRes] = await Promise.all([
    fetchAPI(`/series/${slug}/chapters/${chapterId}`) as Promise<KomikcastChapterContentResponse>,
    fetchAPI(`/series/${slug}?includeMeta=true`) as Promise<KomikcastDetailResponse>,
    fetchAPI(`/series/${slug}/chapters`) as Promise<KomikcastReadChapterResponse>
  ]);

  const chapterData = contentRes.data;
  if (!chapterData) {
    throw new Error("Chapter not found");
  }

  const komikData = detailRes.data;
  const chapters = chapListRes.data || [];

  const sortedChapters = [...chapters].sort((a, b) => a.data.index - b.data.index);
  
  const currentIndex = sortedChapters.findIndex((ch) => ch.data.index.toString() === chapterId);
  let prevChapterId: number | null = null;
  let nextChapterId: number | null = null;

  if (currentIndex !== -1) {
    if (currentIndex > 0) {
      prevChapterId = sortedChapters[currentIndex - 1].data.index;
    }
    if (currentIndex < sortedChapters.length - 1) {
      nextChapterId = sortedChapters[currentIndex + 1].data.index;
    }
  }

  const chapterList = sortedChapters.map((ch) => ({
    id: ch.id,
    chapterIndex: ch.data.index,
    slug: ch.data.slug,
    title: ch.data.title,
    createdAt: ch.createdAt,
    updatedAt: ch.updatedAt,
  }));

  const result: ReadChapterContent = {
    id: chapterData.id,
    chapterIndex: chapterData.chapterIndex,
    komikTitle: komikData?.data?.title || "",
    komikSlug: komikData?.data?.slug || slug,
    images: (chapterData.data.images || []).map(
      (img) => `${baseUrl}/api/proxy?url=${encodeURIComponent(img)}`
    ),
    createdAt: chapterData.createdAt,
    updatedAt: chapterData.updatedAt,
    prevChapterId,
    nextChapterId,
    chapterList,
  };

  return result;
}
