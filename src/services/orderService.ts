import { db } from '../config/database';
import { Order, OrderItem, CreateOrderDTO } from '../types/models/order.types';

export const orderService = {
  async createOrder(data: CreateOrderDTO) {
    return await db.begin(async (sql) => {
      const [order] = await sql`
        INSERT INTO orders (
          customer_name, 
          customer_email, 
          total
        ) VALUES (
          ${data.customerName}, 
          ${data.customerEmail}, 
          ${data.total}
        ) RETURNING *
      `;

      if (data.items?.length) {
        await sql`
          INSERT INTO order_items ${sql(
            data.items.map((item: OrderItem) => ({
              order_id: order.id,
              product_id: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          )}
        `;
      }

      return order;
    });
  },

  async getOrders() {
    const orders = await db`
      SELECT * FROM orders 
      ORDER BY created_at DESC
    `;
    return orders;
  },

  async getOrderById(id: string) {
    const [order] = await db`
      SELECT 
        o.*,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', oi.id,
              'productId', oi.product_id,
              'quantity', oi.quantity,
              'price', oi.price
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ${id}
      GROUP BY o.id
    `;
    return order;
  },

  async updateOrderStatus(id: string, status: Order['status']) {
    const [updated] = await db`
      UPDATE orders 
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;
    return updated;
  }
};
