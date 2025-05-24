import { StockMovement } from '../models/inventory.types';

export interface InventoryService {
  getStock(productId: string): Promise<number>;
  updateStock(productId: string, quantity: number): Promise<void>;
  addStockMovement(movement: Omit<StockMovement, 'id'>): Promise<StockMovement>;
  getStockMovements(productId: string): Promise<StockMovement[]>;
  getLowStockAlerts(): Promise<Array<{ productId: string; stock: number }>>;
}
