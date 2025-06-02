import { z } from 'zod'

export const OrderStatus = z.enum([
  'pending',
  'processing',
  'completed',
  'cancelled',
  'refunded'
])

export type OrderStatus = z.infer<typeof OrderStatus>

export const OrderItemSchema = z.object({
  id: z.string().uuid().optional(),
  order_id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  quantity: z.number().positive(),
  unit_price: z.number().positive(),
  created_at: z.date().optional()
})

export const OrderSchema = z.object({
  id: z.string().uuid().optional(),
  customer_email: z.string().email(),
  status: OrderStatus.default('pending'),
  total_amount: z.number().positive(),
  items: z.array(OrderItemSchema),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
})

export type Order = z.infer<typeof OrderSchema>
export type OrderItem = z.infer<typeof OrderItemSchema>
