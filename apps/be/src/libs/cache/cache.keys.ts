/**
 * Cache Key Builder
 *
 * Centralized cache key management for consistent naming and easy maintenance.
 * All cache keys should be defined here.
 */
export const CachePrefix = {
  USER: 'user',
  OVERVIEW: 'overview',
  STS: 'sts',
} as const;

export const CacheKeys = {
  user: {
    byProviderId: (providerId: string): string =>
      `${CachePrefix.USER}:provider:${providerId}`,
  },
  overview: {
    byUser: (userId: string): string =>
      `${CachePrefix.OVERVIEW}:user:${userId}`,
  },
  sts: {
    byUser: (userId: string): string => `${CachePrefix.STS}:user:${userId}`,
  },
} as const;

export type CacheKeyBuilder = typeof CacheKeys;
