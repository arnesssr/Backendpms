import { Pool, PoolClient } from 'pg';
import { DatabaseConfig } from '../types/database';
import dotenv from 'dotenv';

// Load environment variables at startup
dotenv.config();

// Validate required database environment variables
if (!process.env.DATABASE_URL || !process.env.DATABASE_POOL_URL) {
  throw new Error('Missing required database environment variables');
}

const baseConfig = {
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
  statement_timeout: 10000,
  query_timeout: 10000,
  keepAlive: true
};

// Direct connection pool for admin operations
const adminPoolConfig: DatabaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ...baseConfig,
  max: 5
};

// Connection pooler for high-concurrency operations
const poolerConfig: DatabaseConfig = {
  connectionString: process.env.DATABASE_POOL_URL,
  ...baseConfig,
  max: 20
};

// Export both pools with validated configurations
export const adminDb = new Pool(adminPoolConfig);
export const db = new Pool(poolerConfig);

export async function dbConnect() {
  let client: PoolClient | undefined;
  let retries = 5;

  while (retries > 0) {
    try {
      client = await db.connect();
      await client.query('SELECT NOW()');
      console.log('Database connected successfully');
      return true;
    } catch (error) {
      retries -= 1;
      console.error(`Database connection error (${retries} retries left):`, error);
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s between retries
    } finally {
      if (client) {
        client.release();
      }
    }
  }
}

// Handle pool errors
db.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

// Handle pool errors
adminDb.on('error', (err: Error) => {
  console.error('Unexpected error on admin client', err);
  process.exit(-1);
});

// Add cleanup on application shutdown
process.on('SIGINT', async () => {
  await Promise.all([
    db.end(),
    adminDb.end()
  ]);
  process.exit(0);
});