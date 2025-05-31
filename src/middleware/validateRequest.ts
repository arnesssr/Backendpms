import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      // Fix: Type assertion for error
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        // Handle unknown error type
        res.status(400).json({ error: 'Invalid request data' });
      }
    }
  };
};
