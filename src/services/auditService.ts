import { db } from '../config/database';
import postgres from 'postgres';

interface AuditEntry {
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, any>;
  performed_by: string;
}

export class AuditService {
  async logAction(entry: AuditEntry): Promise<void> {
    return await db.begin(async (client: postgres.TransactionSql) => {
      await client`
        INSERT INTO audit_logs ${client(entry)}
      `;

      // Also store in analytics if significant change
      if (this.isSignificantChange(entry)) {
        await client`
          INSERT INTO analytics_events (
            type, data, created_at
          ) VALUES (
            'significant_change',
            ${JSON.stringify(entry)}::jsonb,
            NOW()
          )
        `;
      }
    });
  }

  private isSignificantChange(entry: AuditEntry): boolean {
    const significantActions = ['delete', 'status_change', 'price_change'];
    return significantActions.includes(entry.action);
  }

  async getAuditHistory(
    entityType: string,
    entityId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    let query = db`
      SELECT * FROM audit_logs 
      WHERE entity_type = ${entityType}
      AND entity_id = ${entityId}
    `;

    if (startDate) query = db`${query} AND created_at >= ${startDate}`;
    if (endDate) query = db`${query} AND created_at <= ${endDate}`;

    return await db`${query} ORDER BY created_at DESC`;
  }
}
