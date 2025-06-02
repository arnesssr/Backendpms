import { db } from '../config/database';
import { ValidationError, NotFoundError } from '../utils/errors';
import postgres from 'postgres';

interface StockMovement {
  product_id: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
}

export class InventoryService {
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
    if (movement.quantity <= 0) {
      throw new ValidationError('Quantity must be positive');
    }

    return await db.begin(async (client: postgres.TransactionSql) => {
      // Record movement
      await client`
        INSERT INTO inventory_movements ${client(movement)}
      `;

      // Update product stock
      const stockChange = movement.type === 'in' ? movement.quantity : -movement.quantity;
      const [updated] = await client`
        UPDATE products 
        SET stock = stock + ${stockChange},
            updated_at = NOW()
        WHERE id = ${movement.product_id}
        RETURNING stock
      `;

      if (updated.stock < 0) {
        throw new ValidationError('Stock cannot be negative');
      }
    });
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
}
