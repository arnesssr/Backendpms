import { Pool, PoolClient } from 'pg';
import { DatabaseConfig } from '../types/database';

const poolConfig: DatabaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon DB
  },
  connectionTimeoutMillis: 5000,
  max: 20
};

export const db = new Pool(poolConfig);

export async function dbConnect() {
  let client: PoolClient;
  try {
    client = await db.connect();
    await client.query('SELECT NOW()'); // Test query
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  } finally {
    client.release(); // Ensure client is always released back to pool
  }
}

// Handle pool errors
db.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Add cleanup on application shutdown
process.on('SIGINT', async () => {
  await db.end(); // Now TypeScript knows this exists
  process.exit(0);
});