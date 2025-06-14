import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cacheService';

export const cacheMiddleware = (ttl: number = 3600) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await cacheService.get(key);
      if (cached) {
        return res.json(cached);
      }
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};
