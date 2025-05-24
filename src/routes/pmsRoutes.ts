import { Router } from 'express';
import { db } from '../config/database';

const router = Router();

// Sync product to storefront
router.post('/sync/product', async (req, res) => {
  try {
    const { productId, status } = req.body;
    const [product] = await db`
      UPDATE products 
      SET 
        published_to_storefront = ${status === 'published'},
        updated_at = NOW()
      WHERE id = ${productId}
      RETURNING *
    `;
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync product' });
  }
});

// Sync inventory
router.post('/sync/inventory', async (req, res) => {
  try {
    const { productId, stock } = req.body;
    const [inventory] = await db`
      UPDATE inventory
      SET stock = ${stock}
      WHERE product_id = ${productId}
      RETURNING *
    `;
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync inventory' });
  }
});

// Get PMS dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const [stats] = await db`
      SELECT 
        COUNT(*) FILTER (WHERE published_to_storefront) as published_count,
        COUNT(*) FILTER (WHERE NOT published_to_storefront) as unpublished_count,
        COUNT(*) as total_products
      FROM products
    `;
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
