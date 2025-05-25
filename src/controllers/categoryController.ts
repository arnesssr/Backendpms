import { Request, Response } from 'express';
import { db } from '../config/database';

export const categoryController = {
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await db`
        SELECT * FROM categories 
        ORDER BY name ASC
      `;
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  },

  async createCategory(req: Request, res: Response) {
    const { name, description } = req.body;
    try {
      const [category] = await db`
        INSERT INTO categories (name, description) 
        VALUES (${name}, ${description}) 
        RETURNING *
      `;
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
};
