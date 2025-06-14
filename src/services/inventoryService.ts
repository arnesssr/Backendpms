import { db } from '../config/database';
import { ValidationError, NotFoundError } from '../utils/errors';
import postgres from 'postgres';
import { supabase } from '../config/supabaseClient';

export interface InventoryData {
  product_id: string;
  quantity: number;
  low_stock_threshold: number;
  status: 'in_stock' | 'out_of_stock' | 'discontinued';
}

export type MovementType = 'increase' | 'decrease';

export interface StockMovement {
  product_id: string;
  quantity: number;
  type: MovementType;
  reason?: string;
  reference?: string;
}

export class InventoryService {
  private static instance: InventoryService;

  static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      InventoryService.instance = new InventoryService();
    }
    return InventoryService.instance;
  }

  protected constructor() {}

  async validateStockLevel(productId: string, quantity: number): Promise<void> {
    const [product] = await db`
      SELECT stock FROM products WHERE id = ${productId}
    `;
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (product.stock < quantity) {
      throw new ValidationError('Insufficient stock');
    }
  }

  async recordMovement(movement: StockMovement): Promise<void> {
    const stockChange = movement.type === 'increase' ? movement.quantity : -movement.quantity;

    // First record the movement
    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: movement.product_id,
        quantity: stockChange,
        type: movement.type,
        reason: movement.reason,
        reference: movement.reference,
        timestamp: new Date().toISOString()
      });

    if (movementError) throw movementError;

    // Then update inventory using rpc
    const { error: updateError } = await supabase
      .rpc('update_inventory_quantity', { 
        p_product_id: movement.product_id,
        p_quantity_change: stockChange 
      });

    if (updateError) throw updateError;
  }

  async getStockHistory(productId: string, startDate?: Date, endDate?: Date) {
    let query = db`
      SELECT 
        im.*,
        p.name as product_name
      FROM inventory_movements im
      JOIN products p ON p.id = im.product_id
      WHERE im.product_id = ${productId}
    `;

    if (startDate) {
      query = db`${query} AND im.created_at >= ${startDate}`;
    }
    if (endDate) {
      query = db`${query} AND im.created_at <= ${endDate}`;
    }

    return await db`${query} ORDER BY im.created_at DESC`;
  }

  async getStockAlert(threshold: number) {
    return await db`
      SELECT 
        p.id,
        p.name,
        p.stock,
        COUNT(im.id) as movement_count
      FROM products p
      LEFT JOIN inventory_movements im ON im.product_id = p.id
      WHERE p.stock <= ${threshold}
      GROUP BY p.id, p.name, p.stock
      ORDER BY p.stock ASC
    `;
  }

  async reconcileStock(productId: string): Promise<void> {
    return await db.begin(async (client: postgres.TransactionSql) => {
      const movements = await client`
        SELECT 
          SUM(CASE WHEN type = 'in' THEN quantity ELSE -quantity END) as net_change
        FROM inventory_movements
        WHERE product_id = ${productId}
      `;

      const [product] = await client`
        SELECT stock FROM products WHERE id = ${productId}
      `;

      if (movements[0].net_change !== product.stock) {
        await client`
          INSERT INTO inventory_movements (
            product_id, type, quantity, reason
          ) VALUES (
            ${productId},
            ${movements[0].net_change > product.stock ? 'out' : 'in'},
            ${Math.abs(movements[0].net_change - product.stock)},
            'Stock reconciliation'
          )
        `;

        await client`
          UPDATE products 
          SET stock = ${movements[0].net_change},
              updated_at = NOW()
          WHERE id = ${productId}
        `;
      }
    });
  }

  async initializeInventory(productId: string): Promise<InventoryData> {
    const inventoryData = {
      product_id: productId,
      quantity: 0,
      status: 'out_of_stock'
      // Removed low_stock_threshold as it doesn't exist in schema
    };

    const { data, error } = await supabase
      .from('inventory')
      .insert(inventoryData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
