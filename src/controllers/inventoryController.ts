import { Request, Response } from 'express';
import { db } from '../config/database';
import type { ControllerResponse } from '../types/controllers/base.controller';
import type { StockMovement } from '../types/models/inventory.types';

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
  },

  async addMovement(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const movement = await db`
        INSERT INTO stock_movements ${db(req.body)}
        RETURNING *
      `;
      res.status(201).json(movement);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add movement' });
    }
  },

  async adjustStock(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { stock } = req.body;
      
      const [updated] = await db`
        UPDATE inventory 
        SET current_stock = ${stock}
        WHERE product_id = ${productId}
        RETURNING *
      `;
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to adjust stock' });
    }
  },

  async getLowStockAlerts(req: Request, res: Response) {
    try {
      const alerts = await db`
        SELECT p.id, p.name, i.current_stock, i.minimum_stock
        FROM inventory i
        JOIN products p ON p.id = i.product_id
        WHERE i.current_stock <= i.minimum_stock
      `;
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch low stock alerts' });
    }
  },

  async getMovements(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const movements = await db`
        SELECT * FROM stock_movements 
        WHERE product_id = ${productId}
        ORDER BY created_at DESC
      `;
      res.json(movements);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch movements' });
    }
  }
};
