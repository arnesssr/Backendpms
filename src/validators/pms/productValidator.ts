import { z } from 'zod';

export const ProductValidator = z.object({
  pmsId: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  stock: z.number().min(0),
  imageUrls: z.array(z.string().url())
});

export const validateProduct = (data: unknown) => {
  return ProductValidator.safeParse(data);
};
