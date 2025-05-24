import { Router } from 'express';
import { db } from '../config/database';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface CreateOrderDTO {
  customerName: string;
  customerEmail: string;
  total: number;
  items: OrderItem[];
}

const router = Router();

// Create order with items
router.post('/', async (req, res) => {
  const { customerName, customerEmail, items, total } = req.body as CreateOrderDTO;

  try {
    // Insert order
    const [order] = await db`
      INSERT INTO orders (customer_name, customer_email, total)
      VALUES (${customerName}, ${customerEmail}, ${total})
      RETURNING *
    `;

    // Insert order items
    if (items && items.length > 0) {
      await db`
        INSERT INTO order_items ${db(
          items.map((item: OrderItem) => ({
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
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await db`SELECT * FROM orders ORDER BY created_at DESC`;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
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
      WHERE o.id = ${req.params.id}
      GROUP BY o.id
    `;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Convert numeric fields to numbers
    res.json({
      ...order,
      total: Number(order.total),
      items: order.items.map((item: any) => ({
        ...item,
        price: Number(item.price)
      }))
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const [updated] = await db`
      UPDATE orders 
      SET status = ${req.body.status} 
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
