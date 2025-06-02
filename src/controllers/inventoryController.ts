import { Request, Response } from 'express';
import { InventoryService } from '../services/inventoryService';
import { ValidationError, NotFoundError } from '../utils/errors';

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  async recordMovement(req: Request, res: Response) {
    try {
      await this.inventoryService.recordMovement(req.body);
      res.status(201).json({ message: 'Movement recorded' });
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Movement recording error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getStockHistory(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { startDate, endDate } = req.query;
      
      const history = await this.inventoryService.getStockHistory(
        productId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      res.json(history);
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Stock history error:', error);
        res.status(500).json({ error: 'Failed to fetch stock history' });
      }
    }
  }

  async getStockAlerts(req: Request, res: Response) {
    try {
      const threshold = Number(req.query.threshold) || 10;
      const alerts = await this.inventoryService.getStockAlert(threshold);
      res.json(alerts);
    } catch (error: unknown) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async reconcileStock(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      await this.inventoryService.reconcileStock(productId);
      res.json({ message: 'Stock reconciled successfully' });
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Stock reconciliation error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
