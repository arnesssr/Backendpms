import { jest, beforeAll, afterAll } from '@jest/globals'
import { Database } from '../types/database'

declare global {
  var createMockDatabase: () => Partial<Database>;
}

beforeAll(async () => {
  // Setup test database connection
  process.env.NODE_ENV = 'test'
})

afterAll(async () => {
  // Cleanup test database
})

// Global test utilities
global.createMockDatabase = (): Partial<Database> => ({
  // Add mock database implementation
})
