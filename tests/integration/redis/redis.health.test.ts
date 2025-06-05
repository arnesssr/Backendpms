import { describe, it, expect, beforeAll } from '@jest/globals';
import { HealthcheckService } from '../../../src/services/healthcheckService';
import { redis } from '../../../src/config/redis';

describe('Redis Health Check', () => {
  const healthService = HealthcheckService.getInstance();

  beforeAll(async () => {
    // Verify Redis connection before tests
    const isConnected = await redis.ping().then(() => true).catch(() => false);
    if (!isConnected) {
      throw new Error('Redis not available for testing');
    }
  });

  it('should report Redis status in health check', async () => {
    const health = await healthService.checkSystem();
    expect(health.redis).toBeDefined();
    expect(health.redis.healthy).toBe(true);
    expect(typeof health.redis.latency).toBe('number');
  });

  it('should include Redis in overall system health', async () => {
    const health = await healthService.checkSystem();
    expect(health).toHaveProperty('redis');
    expect(health).toHaveProperty('database');
    expect(health).toHaveProperty('memory');
  });
});
