import { db } from '../config/database';
import postgres from 'postgres';
import { supabase } from '../config/supabaseClient';
import { NotFoundError, ValidationError } from '../utils/errors';  // Fixed relative path

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

interface LocationStock {
  location_id: string;
  quantity: number;
  minimum_stock: number;
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
    const [product] = await db.sql`
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
    let query = db.sql`
      SELECT 
        im.*,
        p.name as product_name
      FROM inventory_movements im
      JOIN products p ON p.id = im.product_id
      WHERE im.product_id = ${productId}
    `;

    if (startDate) {
      query = db.sql`${query} AND im.created_at >= ${startDate}`;
    }
    if (endDate) {
      query = db.sql`${query} AND im.created_at <= ${endDate}`;
    }

    return await db.sql`${query} ORDER BY im.created_at DESC`;
  }

  async getStockAlert(threshold: number) {
    return await db.sql`
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
    const transaction = await db.sql.begin(async (sql: postgres.TransactionSql) => {
      const movements = await sql`
        SELECT SUM(CASE 
          WHEN type = 'in' THEN quantity 
          ELSE -quantity 
        END) as net_change 
        FROM inventory_movements 
        WHERE product_id = ${productId}
      `;

      const [product] = await sql`
        SELECT stock FROM products WHERE id = ${productId}
      `;

      if (movements[0].net_change !== product.stock) {
        await sql`
          INSERT INTO inventory_movements (product_id, type, quantity, reason)
          VALUES (
            ${productId},
            ${movements[0].net_change > product.stock ? 'out' : 'in'},
            ${Math.abs(movements[0].net_change - product.stock)},
            ${`Stock reconciliation`}
          )
        `;

        await sql`
          UPDATE products 
          SET stock = ${movements[0].net_change},
              updated_at = NOW()
          WHERE id = ${productId}
        `;
      }
    });
    return transaction;
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

  async validateStockMovement(
    productId: string,
    quantity: number,
    locationId: string
  ): Promise<boolean> {
    const { data: currentStock } = await supabase
      .from('location_inventory')
      .select('quantity')
      .eq('product_id', productId)
      .eq('location_id', locationId)
      .single();

    // Explicitly handle null case
    if (!currentStock) {
      return false;
    }

    return currentStock.quantity >= Math.abs(quantity);
  }

  async handleStockMovement(
    productId: string,
    locationId: string,
    quantity: number,
    type: 'in' | 'out',
    reference?: string
  ): Promise<void> {
    const { data: location } = await supabase
      .rpc('handle_stock_movement', {
        p_product_id: productId,
        p_location_id: locationId,
        p_quantity: type === 'in' ? quantity : -quantity,
        p_reference: reference
      });

    if (!location) {
      throw new Error('Failed to process stock movement');
    }
  }

  async checkReorderPoints(): Promise<void> {
    const { data: lowStock } = await supabase
      .from('inventory')
      .select(`
        product_id,
        stock,
        minimum_stock,
        products!inner (
          default_supplier_id,
          reorder_quantity,
          unit_cost
        )
      `)
      .filter('stock', 'lte', 'minimum_stock')
      .eq('auto_reorder', true);

    if (lowStock) {
      await Promise.all(
        lowStock.map(item => 
          this.createAutomaticReorder(item.product_id)
        )
      );
    }
  }

  private async createAutomaticReorder(productId: string): Promise<void> {
    await supabase.rpc('create_automatic_reorder', {
      p_product_id: productId
    });
  }
}
