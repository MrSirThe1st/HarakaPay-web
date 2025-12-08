// Global API caching utility
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() // Store timestamp but don't use for expiration
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // No automatic expiration - cache persists until manually cleared
    return entry.data as T;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear cache entries that match a pattern
  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Global cache instance
export const apiCache = new APICache();

// Helper function to create cache keys
export function createCacheKey(prefix: string, params: Record<string, unknown> = {}): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, unknown>);
  
  return `${prefix}:${JSON.stringify(sortedParams)}`;
}

// Helper function for cached API calls
export async function cachedApiCall<T>(
  cacheKey: string,
  apiCall: () => Promise<T>
): Promise<T> {
  // Check cache first
  const cached = apiCache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Make API call
  const result = await apiCall();

  // Cache the result (no TTL - persists until manually cleared)
  apiCache.set(cacheKey, result);

  return result;
}

// Synchronous cache check helper for React components
export function getCachedData<T>(cacheKey: string): T | null {
  return apiCache.get<T>(cacheKey);
}
