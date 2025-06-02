import { z } from 'zod';

export const CategoryStatus = z.enum(['active', 'inactive', 'archived']);
export type CategoryStatus = z.infer<typeof CategoryStatus>;

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  status: CategoryStatus.default('active'),
  product_count: z.number().default(0),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

export type Category = z.infer<typeof CategorySchema>;
