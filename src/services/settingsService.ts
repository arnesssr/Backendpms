import { db } from '../config/database';
import { ValidationError } from '../utils/errors';
import postgres from 'postgres';

interface SystemSetting {
  key: string;
  value: unknown;
  category: string;
  description?: string;
}

interface SettingRow {
  key: string;
  value: unknown;
  category: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export class SettingsService {
  async upsertSetting(setting: SystemSetting): Promise<void> {
    return await db.begin(async (client: postgres.TransactionSql) => {
      const [existing] = await client<SettingRow[]>`
        SELECT * FROM settings WHERE key = ${setting.key}
      `;

      if (existing) {
        await client`
          UPDATE settings 
          SET 
            value = ${JSON.stringify(setting.value)}::jsonb,
            updated_at = NOW()
          WHERE key = ${setting.key}
        `;
      } else {
        // Use client(object) syntax for proper parameter handling
        await client`
          INSERT INTO settings ${client({
            key: setting.key,
            value: JSON.stringify(setting.value),
            category: setting.category,
            description: setting.description || null
          })}
        `;
      }
    });
  }

  async getSettingsByCategory(category: string) {
    return await db`
      SELECT * FROM settings 
      WHERE category = ${category}
      ORDER BY key
    `;
  }

  async validateSettings(): Promise<boolean> {
    const requiredSettings = [
      'system.timezone',
      'system.currency',
      'inventory.low_stock_threshold'
    ];

    const [result] = await db`
      SELECT COUNT(*) as count 
      FROM settings 
      WHERE key = ANY(${requiredSettings})
    `;

    return result.count === requiredSettings.length;
  }
}
