import { db } from '../config/database';
import redisClient from '../config/redis';

export async function getDatabaseStatus() {
  try {
    await db.pool.query('SELECT 1');
    return {
      healthy: true,
      latency: 0
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getRedisStatus() {
  try {
    const start = Date.now();
    await redisClient.ping();
    return {
      healthy: true,
      latency: Date.now() - start,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Redis health check failed:', error);
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}
