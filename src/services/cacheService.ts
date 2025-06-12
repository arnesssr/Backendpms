import { redis } from '../config/redis';

export class CacheService {
  private static instance: CacheService;
  private defaultTTL: number = 3600; // 1 hour

  // Make constructor public
  constructor() {
    if (CacheService.instance) {
      return CacheService.instance;
    }
    CacheService.instance = this;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: string, ttlSeconds: number = 3600): Promise<boolean> {
    try {
      const result = await redis.set(key, value, {
        EX: ttlSeconds // Expiration in seconds
      });
      return result === 'OK';
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async invalidate(key: string): Promise<void> {
    await redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length) {
      await redis.del(keys);
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService();
