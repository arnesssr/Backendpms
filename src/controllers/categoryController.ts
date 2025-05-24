import { Request, Response } from 'express';
import { db } from '../config/database';
import { Category } from '../types/models/controllers';

export const categoryController = {
  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await db<Category[]>`
        SELECT * FROM categories
        ORDER BY name ASC
      `;
      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  },

  async createCategory(req: Request, res: Response) {
    const { name, description } = req.body;
    try {
      const { rows } = await db.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
}
