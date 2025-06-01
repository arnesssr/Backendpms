import { beforeAll, afterAll, afterEach } from '@jest/globals';
import dotenv from 'dotenv'
import { db } from '../config/database'

// Load test environment first
dotenv.config({ path: '.env.test' })

beforeAll(async () => {
  try {
    // Execute each command separately
    await db`DROP TABLE IF EXISTS products CASCADE`
    
    await db`CREATE TABLE IF NOT EXISTS products (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      stock INTEGER DEFAULT 0,
      image_urls TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`

    console.log('Test database initialized')
  } catch (error) {
    console.error('Database setup failed:', error)
    process.exit(1)
  }
})

// Increase timeout for async operations
jest.setTimeout(10000);

// Clear any mocks/timers after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Cleanup after all tests
afterAll(async () => {
  await db.end();
  // Wait for connections to close
  await new Promise(resolve => setTimeout(resolve, 500));
});

export {}
