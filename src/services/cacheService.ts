import { redis } from '../config/redis';

export class CacheService {
  private static instance: CacheService;
  private readonly DEFAULT_TTL = 3600; // 1 hour
  get: any;

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async getCached<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    // Try cache first
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    // Fetch fresh data
    const data = await fetchFn();
    
    // Cache the result
    await redis.set(key, JSON.stringify(data), 'EX', ttl || this.DEFAULT_TTL);
    
    return data;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length) {
      await redis.del(keys);
    }
  }

  async warmCache(key: string, data: any, ttl?: number): Promise<void> {
    await redis.set(key, JSON.stringify(data), 'EX', ttl || this.DEFAULT_TTL);
  }
}

// Export singleton instance instead of class
export const cacheService = CacheService.getInstance();
