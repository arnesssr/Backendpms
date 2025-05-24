import { Request, Response } from 'express';
import { db } from '../config/database';
import { Product } from '../types/models/controllers';

export const productController = {
  async getAllProducts(req: Request, res: Response) {
    try {
      const products = await db`
        SELECT * FROM products
        WHERE status = 'published'
      `;
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  },

  async createProduct(req: Request, res: Response) {
    const { name, price, description, category, imageUrls } = req.body;
    try {
      const [product] = await db`
        INSERT INTO products (
          name, 
          price, 
          description, 
          category, 
          image_urls
        ) VALUES (
          ${name}, 
          ${price}, 
          ${description}, 
          ${category}, 
          ${imageUrls}
        )
        RETURNING *
      `;
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  },

  async updateProduct(req: Request, res: Response) {
    const { id } = req.params;
    const { name, price, description } = req.body;
    try {
      const [updated] = await db`
        UPDATE products 
        SET 
          name = ${name}, 
          price = ${price}, 
          description = ${description},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
};
