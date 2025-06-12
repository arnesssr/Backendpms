import { z } from 'zod';

export const InventoryAdjustmentValidator = z.object({
  productId: z.string().uuid(),
  type: z.enum(['increase', 'decrease']),
  quantity: z.number().positive(),
  reason: z.string().min(1)
});

export const validateInventoryAdjustment = (data: unknown) => {
  return InventoryAdjustmentValidator.safeParse(data);
};
