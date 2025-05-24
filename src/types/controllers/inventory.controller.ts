import { Request, Response } from 'express';
import { StockMovement } from '../models/inventory.types';

export interface InventoryController {
  getStock(req: Request, res: Response): Promise<void>;
  updateStock(req: Request, res: Response): Promise<void>;
  addMovement(req: Request, res: Response): Promise<void>;
  getMovements(req: Request, res: Response): Promise<void>;
}

export interface UpdateStockRequest extends Request {
  body: {
    stock: number;
  };
}

export interface AddMovementRequest extends Request {
  body: Omit<StockMovement, 'id' | 'createdAt'>;
}
