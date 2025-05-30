import postgres from 'postgres';
import dotenv from 'dotenv';
import { type Sql } from 'postgres';

dotenv.config();

if (!process.env.DATABASE_POOL_URL) {
  throw new Error('DATABASE_POOL_URL is not set');
}

const sql: Sql = postgres(process.env.DATABASE_POOL_URL, {
  connect_timeout: 30,
  idle_timeout: 20
});

export const dbConnect = async () => {
  try {
    console.log('Attempting database connection...');
    const result = await sql`SELECT NOW()`;
    console.log('Database connected successfully at:', result[0].now);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Add test query
export const testConnection = async () => {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Supabase connection successful:', result);
    
    // Test tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📋 Available tables:', tables.map(t => t.table_name));
    
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
};

export const db = sql;
export default sql;