import { Router, Request, Response } from 'express';
import { db } from '../config/database';

const router = Router();

// Create initial inventory record when creating a product
router.post('/:productId', async (req: Request, res: Response) => {
  try {
    const [inventory] = await db`
      INSERT INTO inventory (product_id, stock, minimum_stock)
      VALUES (${req.params.productId}, 0, 5)
      RETURNING *
    `;
    res.status(201).json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create inventory record' });
  }
});

// Get stock level
router.get('/:productId/stock', async (req, res) => {
  try {
    const [inventory] = await db`
      SELECT * FROM inventory 
      WHERE product_id = ${req.params.productId}
    `;
    res.json(inventory || { stock: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

// Update stock level
router.put('/:productId/stock', async (req, res) => {
  try {
    const [updated] = await db`
      INSERT INTO inventory (product_id, stock)
      VALUES (${req.params.productId}, ${req.body.stock})
      ON CONFLICT (product_id) 
      DO UPDATE SET stock = ${req.body.stock}
      RETURNING *
    `;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Get stock movements - Simplified
router.get('/:productId/movements', async (req, res) => {
  try {
    const movements = await db`
      SELECT id, product_id, type, quantity, notes, created_at
      FROM stock_movements 
      WHERE product_id = ${req.params.productId}
      ORDER BY created_at DESC
    `;
    res.json(movements);
  } catch (error) {
    console.error('Get movements error:', error);
    res.status(500).json({ error: 'Failed to fetch movements' });
  }
});

// Add stock movement
router.post('/:productId/movements', async (req, res) => {
  try {
    const [movement] = await db`
      INSERT INTO stock_movements (
        product_id, type, quantity, notes
      ) VALUES (
        ${req.params.productId},
        ${req.body.type},
        ${req.body.quantity},
        ${req.body.notes}
      )
      RETURNING *
    `;
    res.status(201).json(movement);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create movement' });
  }
});

// Get low stock alerts
router.get('/low-stock', async (req, res) => {
  try {
    const alerts = await db`
      SELECT p.id, p.name, i.stock, i.minimum_stock
      FROM inventory i
      JOIN products p ON p.id = i.product_id
      WHERE i.stock <= i.minimum_stock
    `;
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
});

export default router;
