import { db } from '../config/database';

interface StockMovement {
  product_id: string;
  type: 'in' | 'out';
  quantity: number;
  notes?: string | null;
}

export const inventoryService = {
  async getStock(productId: string) {
    const [inventory] = await db`
      SELECT * FROM inventory 
      WHERE product_id = ${productId}
    `;
    return inventory;
  },

  async updateStock(productId: string, stock: number) {
    const [updated] = await db`
      UPDATE inventory 
      SET stock = ${stock}
      WHERE product_id = ${productId}
      RETURNING *
    `;
    return updated;
  },

  async trackMovement(data: { productId: string; type: string; quantity: number; notes?: string }) {
    const values: StockMovement = {
      product_id: data.productId,
      type: data.type as 'in' | 'out',
      quantity: data.quantity,
      notes: data.notes || null // Convert undefined to null for SQL
    };

    const [movement] = await db`
      INSERT INTO stock_movements ${db(values)}
      RETURNING *
    `;
    
    return movement;
  }
};
