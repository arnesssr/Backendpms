import { db } from '../config/database';
import { Order, OrderItem, OrderStatus } from '../models/Order';
import { ValidationError, NotFoundError } from '../utils/errors';
import postgres from 'postgres';

// Define database row types
interface OrderRow {
  id: string;
  customer_email: string;
  total_amount: string; // Decimal comes as string from DB
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: string; // Decimal comes as string from DB
  created_at: Date;
}

// Add mapping functions
function mapOrderRowToOrder(row: OrderRow, items: OrderItemRow[] = []): Order {
  return {
    id: row.id,
    customer_email: row.customer_email,
    total_amount: Number(row.total_amount),
    status: row.status,
    items: items.map(item => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      created_at: item.created_at
    })),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export class OrderService {
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    return await db.begin(async (client: postgres.TransactionSql) => {
      // Create order with proper parameter typing
      const [order] = await client<OrderRow[]>`
        INSERT INTO orders (
          customer_email, 
          total_amount, 
          status
        ) VALUES (
          ${orderData.customer_email || ''},
          ${orderData.total_amount || 0},
          ${orderData.status || 'pending'}::text
        ) RETURNING *
      `;

      // Handle order items if present
      if (orderData.items?.length) {
        const itemValues = orderData.items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price.toString()
        }));

        await client`
          INSERT INTO order_items ${client(itemValues)}
        `;

        // Update product stock with proper typing
        for (const item of orderData.items) {
          await client`
            UPDATE products 
            SET stock = stock - ${item.quantity}::integer
            WHERE id = ${item.product_id}::uuid
            AND stock >= ${item.quantity}::integer
          `;
        }
      }

      return mapOrderRowToOrder(order);
    });
  }

  async updateOrderStatus(
    orderId: string, 
    status: OrderStatus
  ): Promise<Order> {
    const [orderRow] = await db<OrderRow[]>`
      SELECT * FROM orders WHERE id = ${orderId}
    `;
    
    if (!orderRow) throw new NotFoundError('Order not found');

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['completed', 'cancelled'],
      completed: ['refunded'],
      cancelled: [],
      refunded: []
    };

    if (!allowedTransitions[orderRow.status]?.includes(status)) {
      throw new ValidationError(
        `Cannot transition from ${orderRow.status} to ${status}`
      );
    }

    const [updatedRow] = await db<OrderRow[]>`
      UPDATE orders 
      SET status = ${status},
          updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING *
    `;

    const items = await db<OrderItemRow[]>`
      SELECT * FROM order_items WHERE order_id = ${orderId}
    `;

    return mapOrderRowToOrder(updatedRow, items);
  }

  async calculateOrderTotal(items: OrderItem[]): Promise<number> {
    let total = 0;
    for (const item of items) {
      const [product] = await db`
        SELECT price FROM products WHERE id = ${item.product_id}
      `;
      if (!product) throw new NotFoundError('Product not found');
      total += Number(product.price) * item.quantity;
    }
    return Number(total.toFixed(2));
  }

  async validateStock(items: OrderItem[]): Promise<void> {
    for (const item of items) {
      const [product] = await db`
        SELECT stock FROM products WHERE id = ${item.product_id}
      `;
      if (!product) throw new NotFoundError('Product not found');
      if (product.stock < item.quantity) {
        throw new ValidationError(
          `Insufficient stock for product ${item.product_id}`
        );
      }
    }
  }

  async processRefund(orderId: string, reason: string): Promise<void> {
    return await db.begin(async (client: postgres.TransactionSql) => {
      const [order] = await client<OrderRow[]>`
        SELECT * FROM orders WHERE id = ${orderId}
      `;

      if (!order) throw new Error('Order not found');
      if (order.status !== 'completed') {
        throw new Error('Can only refund completed orders');
      }

      // Update order status
      await client`
        UPDATE orders 
        SET status = 'refunded',
            updated_at = NOW()
        WHERE id = ${orderId}
      `;

      // Return items to inventory
      const items = await client`
        SELECT * FROM order_items WHERE order_id = ${orderId}
      `;

      for (const item of items) {
        await client`
          UPDATE products 
          SET stock = stock + ${item.quantity}
          WHERE id = ${item.product_id}
        `;
      }

      // Log refund
      await client`
        INSERT INTO refunds (
          order_id, reason, amount, processed_at
        ) VALUES (
          ${orderId}, ${reason}, ${order.total_amount}, NOW()
        )
      `;
    });
  }
}
