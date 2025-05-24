import { Router, Request, Response } from 'express';
import sql from '../config/database';  // Changed from { db }

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await sql`
      SELECT * FROM products 
      WHERE status = 'published'
    `;
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, price, description, category, status = 'draft' } = req.body;
    const result = await sql`
      INSERT INTO products (
        name, price, description, category, status
      ) VALUES (
        ${name}, ${price}, ${description}, ${category}, ${status}
      )
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await sql`
      SELECT * FROM products 
      WHERE id = ${id}
    `;
    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, price, description } = req.body;
    
    // Parse price to number if provided
    const updates = {
      ...(name && { name }),
      ...(price && { price: Number(price) }),
      ...(description && { description })
    };

    const [updated] = await sql`
      UPDATE products 
      SET ${sql(updates)}
      WHERE id = ${req.params.id}
      RETURNING *
    `;

    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Ensure price is returned as number
    res.json({
      ...updated,
      price: Number(updated.price)
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await sql`
      DELETE FROM products 
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result[0]);
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
