/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PaginatedResponse<T> {
  page: number;
  hasNextPage: boolean;
  data: T[];
}

export interface HeroKomik {
  title: string;
  nativeTitle: string;
  author: string;
  slug: string;
  format: string;
  backgroundImage: string;
  cover: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreviewChapter {
  chapterIndex: number;
  updatedAt: string;
  createdAt: string;
}

export interface PopularKomik {
  title: string;
  slug: string;
  cover: string;
  rating: string;
  type: string;
  isHot: boolean;
  isRecommended: boolean;
  chapters: PreviewChapter[];
  createdAt: string;
  updatedAt: string;
  author: string;
  format: string;
  nativeTitle: string;
  releaseDate: string;
  backgroundImage: string;
  genres: KomikcastGenre[];
}

export type NewestKomik = PopularKomik;

export interface RecommendedKomik {
  cover: string;
  title: string;
  nativeTitle: string;
  slug: string;
  author: string;
  rating: string;
  status: string;
  format: string;
  type: string;
  isHot: boolean;
  totalChapters: string;
}

export interface ChapterKomik {
  id: number;
  chapterIndex: number;
  slug: string | null;
  title: string | null;
  createdAt: string;
}

export interface ReadChapter {
  id: number;
  chapterIndex: number;
  slug: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReadChapterContent {
  id: number;
  chapterIndex: number;
  komikTitle: string;
  komikSlug: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  prevChapterId: number | null;
  nextChapterId: number | null;
  chapterList: ReadChapter[];
}

export interface DetailKomik extends Omit<PopularKomik, "chapters"> {
  synopsis: string;
  totalChapters: string;
  isAnimeAdapted: boolean;
  status: string;
  readChapter: ReadChapter[];
  recommended: RecommendedKomik[];
}

export interface KomikcastGenreData {
  name: string;
  description: string;
}

export interface KomikcastGenre {
  id: number;
  data: KomikcastGenreData;
  createdAt: string;
  updatedAt: string;
}

export interface KomikcastSeriesData {
  slug: string;
  type: string;
  isHot: boolean;
  title: string;
  author: string;
  format: string;
  rating: number;
  status: string;
  isDraft: boolean;
  genreIds: number[];
  isBanner?: boolean;
  synopsis: string;
  folderCdn: string;
  coverImage: string;
  animeStatus: null | string;
  bannerIndex?: number;
  nativeTitle: string;
  releaseDate: string;
  isRecommended: boolean;
  totalChapters: string;
  animeAdaptation: boolean;
  backgroundImage: string;
  genres: KomikcastGenre[];
  totalViews?: number;
  monthlyViews?: number;
  bookmarkCount?: number;
}

export interface KomikcastDataMetadata {
  ranking: number;
  dailyViews: number;
  weeklyViews: number;
  monthlyViews: number;
  bookmarkCount: number;
  isRecommended: boolean;
  viewsUpdatedAt: string;
  totalViewsComputed: number;
  totalViews?: number;
  historyViews?: number;
  analyticsViews?: number;
}

export interface KomikcastViews {
  analytics: number;
  history: number;
  total: number;
}

export interface KomikcastMetadata {
  views: KomikcastViews;
  bookmarkCount: number;
  ranking: number;
}

export interface KomikcastChapterDataImages {
  [key: string]: string;
}

export interface KomikcastChapterData {
  slug: string | null;
  title: string | null;
  images: any[];
  isDraft: boolean;
  thumbnail: string | null;
  totalViews: number;
  historyViews: number;
  analyticsViews: number;
  viewsUpdatedAt: string;
}

export interface KomikcastReadChapterData {
  slug: string | null;
  title: string | null;
  index: number;
  isDraft: boolean;
  seriesId: number;
  thumbnail: string | null;
}

export interface KomikcastChapterItem {
  id: number;
  data: KomikcastChapterData;
  createdAt: string;
  updatedAt: string;
  dataImages: KomikcastChapterDataImages;
  seriesId: number;
  chapterIndex: number;
  isDraft: boolean;
  isRead: boolean;
}

export interface KomikcastReadChapterItem {
  id: number;
  createdAt: string;
  updatedAt: string;
  data: KomikcastReadChapterData;
}

export interface KomikcastSeriesItem {
  id: number;
  data: KomikcastSeriesData;
  createdAt: string;
  updatedAt: string;
  dataMetadata: KomikcastDataMetadata;
  isDraft: boolean;
  metadata?: KomikcastMetadata;
  chapters?: KomikcastChapterItem[];
}

export interface KomikcastMeta {
  total: number;
  page: number;
  lastPage: number;
  take?: number;
}

export interface KomikcastResponse<T = KomikcastSeriesItem[]> {
  status: number;
  message: string;
  data: T;
  meta?: KomikcastMeta;
}

export type KomikcastBannerResponse = KomikcastResponse;
export type KomikcastPopularResponse = KomikcastResponse;
export type KomikcastNewestResponse = KomikcastResponse;
export type KomikcastRecommendedResponse = KomikcastResponse;
export type KomikcastDetailResponse = KomikcastResponse<KomikcastSeriesItem>;
export type KomikcastReadChapterResponse = KomikcastResponse<
  KomikcastReadChapterItem[]
>;

export interface KomikcastChapterContentData {
  slug: string | null;
  title: string | null;
  images: string[];
  isDraft: boolean;
  thumbnail: string | null;
  totalViews: number;
  historyViews: number;
  analyticsViews: number;
  viewsUpdatedAt: string;
}

export interface KomikcastChapterContentItem {
  id: number;
  createdAt: string;
  updatedAt: string;
  data: KomikcastChapterContentData;
  seriesId: number;
  chapterIndex: number;
  isDraft: boolean;
  isRead: boolean;
  views: KomikcastViews;
}

export type KomikcastChapterContentResponse =
  KomikcastResponse<KomikcastChapterContentItem>;

export interface FilterKomik {
  title: string;
  slug: string;
  synopsis: string;
  cover: string;
  rating: string;
  type: string;
  isHot: boolean;
  isRecommended: boolean;
  chapters: PreviewChapter[];
  createdAt: string;
  updatedAt: string;
  author: string;
  format: string;
  nativeTitle: string;
  releaseDate: string;
  backgroundImage: string;
  genres: KomikcastGenre[];
  status: string;
  totalChapters: string;
}

export type KomikcastFilterResponse = KomikcastResponse;
export type KomikcastGenresResponse = KomikcastResponse<KomikcastGenre[]>;

export interface PopularCategoryItem {
  id: number;
  data: {
    slug: string;
    type: string;
    isHot: boolean;
    title: string;
    author: string;
    format: string;
    rating: number;
    status: string;
    genreIds: number[];
    coverImage: string;
    animeStatus: string | null;
    nativeTitle: string;
    totalChapters: string;
    animeAdaptation: boolean;
    backgroundImage: string;
    genres: KomikcastGenre[];
  };
  createdAt: string;
  updatedAt: string;
  weightedScore: string | null;
  priorityScore: number | null;
}

export type PopularCategoryResponse = KomikcastResponse<PopularCategoryItem[]>;
