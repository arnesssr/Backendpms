import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/cacheService';

export const queryOptimizer = () => {
  const cache = CacheService.getInstance();
  
  return async (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = `query:${req.method}:${req.originalUrl}`;
    
    if (req.method === 'GET') {
      try {
        const data = await cache.getCached(
          cacheKey,
          async () => {
            // Store original send
            const originalSend = res.send;
            
            return new Promise((resolve) => {
              res.send = function(body) {
                // Restore original send
                res.send = originalSend;
                resolve(body);
                return res.send(body);
              };
              next();
            });
          },
          300 // 5 minutes cache
        );

        if (res.headersSent) return;
        return res.send(data);
      } catch (error) {
        next(error);
      }
    } else {
      // Invalidate related GET caches on mutations
      await cache.invalidatePattern(`query:GET:${req.baseUrl}*`);
      next();
    }
  };
};
