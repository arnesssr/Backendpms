import { generateApiKey } from './auth/generateApiKey';
import { seedDatabase } from './db/seedDatabase';
import { setupTestDb } from './test/setupTestDb';
import { generateTestData } from './test/generateTestData';

export const scripts = {
  auth: {
    generateApiKey
  },
  db: {
    seedDatabase
  },
  test: {
    setupTestDb,
    generateTestData
  }
};
