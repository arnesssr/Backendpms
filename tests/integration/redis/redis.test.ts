import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { redis } from '../../../src/config/redis';

describe('Redis Integration', () => {
  beforeAll(async () => {
    // Ensure Redis is connected
    await redis.ping();
  });

  beforeEach(async () => {
    await redis.flushdb(); // Clear all test data
  });

  it('should connect to Redis successfully', async () => {
    const ping = await redis.ping();
    expect(ping).toBe('PONG');
  });

  it('should set and get a value', async () => {
    await redis.set('test:key', 'hello');
    const value = await redis.get('test:key');
    expect(value).toBe('hello');
  });

  it('should handle JSON values', async () => {
    const testObject = { name: 'test', value: 123 };
    await redis.set('test:key', JSON.stringify(testObject));
    const value = await redis.get('test:key');
    expect(JSON.parse(value!)).toEqual(testObject);
  });

  it('should handle key expiration', async () => {
    await redis.setex('test:key', 1, 'expires-soon');
    expect(await redis.get('test:key')).toBe('expires-soon');
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100));
    expect(await redis.get('test:key')).toBeNull();
  });

  it('should handle multiple operations', async () => {
    const pipeline = redis.pipeline();
    pipeline.set('test:key', 'value1');
    pipeline.get('test:key');
    const results = await pipeline.exec();
    expect(results![1][1]).toBe('value1');
  });
});
