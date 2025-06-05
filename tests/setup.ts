import { jest, beforeAll, afterAll } from '@jest/globals';
import dotenv from 'dotenv';

// Load env before any imports
process.env.NODE_ENV = 'test';
dotenv.config();

// Import after env setup
import { redis } from '../src/config/redis';
import { WebhookQueue } from '../src/services/webhookQueueService';

jest.setTimeout(30000);

// Single cleanup at the very end
afterAll(async () => {
  try {
    await WebhookQueue.cleanup();
    // Add delay before Redis cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    await redis.quit();
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});
