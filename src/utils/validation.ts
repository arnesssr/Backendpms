import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const productSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  description: z.string(),
  category: z.string(),
  imageUrls: z.array(z.string().url()),
  status: z.enum(['draft', 'published', 'archived']),
  stock: z.number().min(0)
});

export const orderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    variantId: z.string().uuid().optional()
  }))
});

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        next(error);
      }
    }
  }
}
