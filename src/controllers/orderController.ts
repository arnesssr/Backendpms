import { Request, Response } from 'express';
import { db } from '../config/database';
import { Order, CreateOrderDTO } from '../types/models/order.types';

export const orderController = {
  async createOrder(req: Request, res: Response) {
    try {
      const { customerName, customerEmail, total, items } = req.body as CreateOrderDTO;
      
      const [order] = await db`
        INSERT INTO orders (customer_name, customer_email, total)
        VALUES (${customerName}, ${customerEmail}, ${total})
        RETURNING *
      `;
      
      if (items?.length) {
        await db`
          INSERT INTO order_items ${db(
            items.map(item => ({
              order_id: order.id,
              product_id: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          )}
        `;
      }
      
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create order' });
    }
  },

  async getOrders(req: Request, res: Response) {
    try {
      const orders = await db<Order[]>`
        SELECT * FROM orders
        ORDER BY created_at DESC
      `;
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }
};
