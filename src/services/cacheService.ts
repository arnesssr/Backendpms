import { redis } from '../config/redis';

export class CacheService {
  private static instance: CacheService;
  private DEFAULT_TTL = 3600; // 1 hour

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await redis.del(key);
  }

  async clearPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length) {
      await redis.del(keys);
    }
  }
}
