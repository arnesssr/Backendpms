import { Router, Request, Response } from 'express';
import { db } from '../config/database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await db`
      SELECT * FROM categories 
      ORDER BY name ASC
    `;
    res.status(200).json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const [category] = await db`
      INSERT INTO categories (id, name, description)
      VALUES (gen_random_uuid(), ${name}, ${description})
      RETURNING *
    `;
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updates: Record<string, any> = {};
    const { name, description } = req.body;

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    const [updated] = await db`
      UPDATE categories 
      SET ${db(updates)}
      WHERE id = ${req.params.id}
      RETURNING *
    `;

    if (!updated) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.get('/:id/products', async (req: Request, res: Response) => {
  try {
    const products = await db`
      SELECT * FROM products 
      WHERE category = (
        SELECT name FROM categories WHERE id = ${req.params.id}
      )
    `;
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category products' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await db`
      DELETE FROM categories 
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
