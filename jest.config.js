module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest']
  },
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/jest.setup.ts'],
  globalSetup: '<rootDir>/src/tests/global.setup.ts',
  globalTeardown: '<rootDir>/src/tests/global.teardown.ts',
  testTimeout: 15000,
  forceExit: true,
  detectOpenHandles: true,
  verbose: true,
  maxWorkers: 1
}
