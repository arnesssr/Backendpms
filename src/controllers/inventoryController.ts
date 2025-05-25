import { Request, Response } from 'express';
import { db } from '../config/database';

export const inventoryController = {
  async updateStock(req: Request, res: Response) {
    const { id } = req.params;
    const { stock } = req.body;
    
    try {
      const [updated] = await db`
        UPDATE inventory 
        SET 
          stock = ${stock}, 
          updated_at = NOW() 
        WHERE product_id = ${id}
        RETURNING *
      `;
      res.json(updated);
    } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(500).json({ error: 'Failed to update inventory' });
    }
  },

  async getProductStock(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const [inventory] = await db`
        SELECT * FROM inventory 
        WHERE product_id = ${id}
      `;
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  },

  async getStock(req: Request, res: Response) {
    try {
      const [stock] = await db`
        SELECT * FROM inventory 
        WHERE product_id = ${req.params.id}
      `;
      res.json(stock || { stock: 0 });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stock' });
    }
  }
};
