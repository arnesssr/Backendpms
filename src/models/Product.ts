import { z } from 'zod';

export const ProductStatus = z.enum(['draft', 'published', 'archived']);
export type ProductStatus = z.infer<typeof ProductStatus>;

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.string(),
  status: ProductStatus.default('draft'),
  stock: z.number().min(0).default(0),
  image_urls: z.array(z.string().url()).min(1),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

export type Product = z.infer<typeof ProductSchema>;
