import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  setupFilesAfterEnv: ['./tests/setup.ts'],
  testTimeout: 10000,
  detectOpenHandles: true,
  forceExit: true,
  verbose: true,
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/types/**',
    '!src/**/*.d.ts'
  ]
};

export default config;
