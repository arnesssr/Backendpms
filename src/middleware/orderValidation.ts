import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  price: z.number().positive()
});

const orderSchema = z.object({
  items: z.array(orderItemSchema).nonempty(),
  customerId: z.string().uuid(),
  shippingAddress: z.string().min(10),
  notes: z.string().optional()
});

export const validateOrder = (req: Request, res: Response, next: NextFunction) => {
  try {
    orderSchema.parse(req.body);
    next();
  } catch (error) {
    const zodError = error as z.ZodError;
    res.status(400).json({
      success: false,
      error: 'Invalid order data',
      details: zodError.errors
    });
  }
};
