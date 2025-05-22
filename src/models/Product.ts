import { z } from 'zod'

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  category_id: z.string().uuid(),
  status: z.enum(['draft', 'published', 'archived']),
  image_urls: z.array(z.string().url()),
  stock: z.number().int().min(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export type Product = z.infer<typeof ProductSchema>
