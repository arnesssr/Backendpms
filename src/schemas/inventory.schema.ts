import { z } from 'zod';

export const createMovementSchema = z.object({
  productId: z.string(),
  type: z.enum(['in', 'out']),
  quantity: z.number().positive(),
  notes: z.string().optional()
});

export const adjustStockSchema = z.object({
  minimumStock: z.number().min(0)
});

export const createOrderSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  supplierId: z.string().optional(),
  notes: z.string().optional()
});
