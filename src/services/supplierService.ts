import { db } from '../config/database';
import { ValidationError } from '../utils/errors';
import postgres from 'postgres';

interface SupplierProduct {
  supplier_id: string;
  product_id: string;
  unit_cost: number;
  minimum_order: number;
  lead_time_days: number;
}

export class SupplierService {
  async linkProductToSupplier(data: SupplierProduct): Promise<void> {
    return await db.begin(async (client: postgres.TransactionSql) => {
      await client`
        INSERT INTO supplier_products ${client(data)}
        ON CONFLICT (supplier_id, product_id) 
        DO UPDATE SET 
          unit_cost = EXCLUDED.unit_cost,
          minimum_order = EXCLUDED.minimum_order,
          lead_time_days = EXCLUDED.lead_time_days
      `;
    });
  }

  async getSupplierPerformance(supplierId: string) {
    const [performance] = await db`
      SELECT 
        s.id,
        s.name,
        COUNT(DISTINCT sp.product_id) as product_count,
        AVG(sp.lead_time_days) as avg_lead_time,
        COUNT(po.id) as total_orders,
        SUM(CASE WHEN po.status = 'completed' THEN 1 ELSE 0 END) as completed_orders
      FROM suppliers s
      LEFT JOIN supplier_products sp ON sp.supplier_id = s.id
      LEFT JOIN purchase_orders po ON po.supplier_id = s.id
      WHERE s.id = ${supplierId}
      GROUP BY s.id, s.name
    `;

    return performance;
  }

  // Add other business-critical methods...
}
