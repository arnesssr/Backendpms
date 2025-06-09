import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/cacheService';

export const cacheMiddleware = (ttl?: number) => {
  const cache = CacheService.getInstance();

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    
    try {
      // Try to get from cache
      const cached = await cache.get(key);
      if (cached) {
        return res.json(cached);
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = function(data: any): Response {
        cache.set(key, data, ttl);
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      // On cache error, continue without caching
      console.error('Cache error:', error);
      next();
    }
  };
};
