import { db } from '../config/database';

export const checkTables = async () => {
  console.log('🔍 Checking database tables...');
  
  try {
    const tables = await db`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    const requiredTables = [
      'products',
      'categories',
      'inventory',
      'orders',
      'order_items'
    ];

    const missingTables = requiredTables.filter(
      table => !tables.find(t => t.table_name === table)
    );

    if (missingTables.length) {
      console.error('❌ Missing tables:', missingTables);
      return false;
    }

    console.log('✅ All required tables exist:', tables.map(t => t.table_name));
    return true;
  } catch (error) {
    console.error('❌ Database check failed:', error);
    return false;
  }
};
