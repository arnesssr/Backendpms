import { Pool, PoolClient } from 'pg';
import { DatabaseConfig } from '../types/database';

// Direct connection pool for admin operations
const adminPoolConfig: DatabaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
  max: 5 // Smaller pool for admin operations
};

// Connection pooler for high-concurrency operations
const poolerConfig: DatabaseConfig = {
  connectionString: process.env.DATABASE_POOL_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
  max: 20 // Larger pool for concurrent operations
};

// Export both pools
export const adminDb = new Pool(adminPoolConfig);
export const db = new Pool(poolerConfig); // Default pool for regular operations

export async function dbConnect() {
  let client: PoolClient | undefined;
  try {
    client = await db.connect();
    await client.query('SELECT NOW()');
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Handle pool errors
db.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

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