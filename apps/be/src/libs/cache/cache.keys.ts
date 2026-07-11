/**
 * Cache Key Builder
 *
 * Centralized cache key management for consistent naming and easy maintenance.
 * All cache keys should be defined here.
 */
export const CachePrefix = {
  USER: 'user',
} as const;

export const CacheKeys = {
  user: {
    byProviderId: (providerId: string): string =>
      `${CachePrefix.USER}:provider:${providerId}`,
  },
} as const;

export type CacheKeyBuilder = typeof CacheKeys;
