export const CACHE_TTL = {
  /** 5 min */
  SHORT: 5 * 60,
  /** 30 min */
  MEDIUM: 30 * 60,
  /** 24h */
  LONG: 24 * 60 * 60,
  /** 7 days */
  STATIC: 7 * 24 * 60 * 60,
} as const;

export function cacheHeader(ttl: number): string {
  return `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`;
}
