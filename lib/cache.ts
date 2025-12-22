// Simple in-memory cache with TTL for frequently accessed data
type CacheEntry<T> = {
  data: T;
  expiry: number;
};

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttlMs ?? this.defaultTTL),
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance (persists across requests in development)
export const cache = new SimpleCache();

// Cache keys
export const CACHE_KEYS = {
  CATEGORIES: 'categories:all',
  CATEGORY_BY_SLUG: (slug: string) => `category:${slug}`,
} as const;
