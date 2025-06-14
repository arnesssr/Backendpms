import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { Pool, PoolClient } from 'pg';

// Load environment variables
dotenv.config();

// Database configuration interface
interface DatabaseConfig {
  max_connections: number;
  idle_timeout: number;
  connect_timeout: number;
  max_lifetime: number;
}

// Connection metrics interface
interface ConnectionMetrics {
  total_connections: number;
  active_connections: number;
  idle_connections: number;
  wait_time: number;
}

const DEFAULT_CONFIG: DatabaseConfig = {
  max_connections: 10,
  idle_timeout: 30,
  connect_timeout: 10,
  max_lifetime: 60 * 30 // 30 minutes
}

// Get appropriate connection URL based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Prioritize different connection URLs based on environment
const DATABASE_URL = 
  isTest ? process.env.DATABASE_POOL_URL :
  isDevelopment ? process.env.DATABASE_URL :
  process.env.DATABASE_POOL_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Environment Variables:', {
    NODE_ENV: process.env.NODE_ENV,
    HAS_POOL_URL: !!process.env.DATABASE_POOL_URL,
    HAS_DB_URL: !!process.env.DATABASE_URL
  });
  throw new Error('Database connection URL not configured');
}

// Create database instance with postgres
const sql = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  idle_timeout: DEFAULT_CONFIG.idle_timeout,
  max: process.env.NODE_ENV === 'production' ? 20 : DEFAULT_CONFIG.max_connections,
  connect_timeout: DEFAULT_CONFIG.connect_timeout,
  max_lifetime: DEFAULT_CONFIG.max_lifetime,
  debug: process.env.NODE_ENV === 'development',
  onnotice: (notice) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Database Notice:', notice);
    }
  }
})

// Connection monitoring
let metrics: ConnectionMetrics = {
  total_connections: 0,
  active_connections: 0,
  idle_connections: 0,
  wait_time: 0
}

// Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Connection health check
export const dbConnect = async () => {
  try {
    // Simple query to verify connection
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (error) throw error;

    console.log('Database connected: PostgreSQL', data ? 'tables accessible' : 'empty schema');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    // Don't throw on startup - allow app to start with degraded functionality
    return false;
  }
};

// Get connection metrics
export const getConnectionMetrics = () => {
  return metrics
}

// Health check with detailed status
export const getDatabaseHealth = async () => {
  try {
    const startTime = Date.now();
    await db.sql`SELECT 1`; // Use db.sql instead of db
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime,
      metrics,
      lastChecked: new Date().toISOString()
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown database error';

    return {
      status: 'unhealthy',
      error: errorMessage,
      lastChecked: new Date().toISOString()
    }
  }
}

// Graceful shutdown
export async function closeDatabase() {
  try {
    console.log('Closing database connections...');
    await db.sql.end();
    
    await new Promise<void>((resolve, reject) => {
      pool.end((error?: Error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error closing database:', error);
    throw error;
  }
}

// Event handlers for process termination
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connections...')
  await closeDatabase()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database connections...')
  await closeDatabase()
  process.exit(0)
})

const pool = new Pool({
  connectionString: process.env.DATABASE_POOL_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Update type definitions
type SqlTransaction = postgres.Sql<{}>;
type PostgresResult<T> = T extends Array<any> ? T[0] : T;
type TransactionCallback<T> = (sql: SqlTransaction) => Promise<T>;

export const db = {
  query: sql, // For direct SQL queries
  sql,       // For template literals
  pool,      // Connection pool
  
  // Transaction support
  async transaction<T>(callback: TransactionCallback<T>): Promise<PostgresResult<T>> {
    return sql.begin(async (transaction) => {
      const result = await callback(transaction);
      // Handle postgres result unwrapping
      if (Array.isArray(result) && result.length === 1) {
        return result[0] as PostgresResult<T>;
      }
      return result as PostgresResult<T>;
    });
  },

  async batchProcess<T>(
    items: T[],
    batchSize: number,
    processFn: (batch: T[]) => Promise<void>
  ): Promise<void> {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await processFn(batch);
    }
  },

  async analyzeQuery(query: string): Promise<any> {
    const result = await pool.query(`EXPLAIN ANALYZE ${query}`);
    return result.rows;
  },

  async end(): Promise<void> {
    await db.sql.end();
    await new Promise<void>((resolve, reject) => {
      pool.end((error?: Error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
};