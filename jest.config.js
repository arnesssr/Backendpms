module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testTimeout: 60000,
  verbose: true,
  detectOpenHandles: true,
  maxConcurrency: 1
}
