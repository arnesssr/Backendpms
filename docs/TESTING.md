# Testing Guide

## Available Test Commands

### Run All Tests
```bash
pnpm test
```
Runs all test suites including unit, integration, and e2e tests.

### Run Specific Test Types

#### Integration Tests
```bash
# Run all integration tests
pnpm test:integration

# Run specific integration tests
pnpm test:redis          # Test Redis integration
pnpm test:db            # Test Database integration
pnpm test:websocket     # Test WebSocket integration
```

#### Unit Tests
```bash
# Run all unit tests
pnpm test:unit

# Run specific service tests
pnpm test src/services/__tests__/productService.test.ts
pnpm test src/services/__tests__/orderService.test.ts
```

#### Health Check Tests
```bash
pnpm test:health        # Run system health check tests
```

## Test Configuration

### Environment
Tests use these environment variables:
```bash
NODE_ENV=test
REDIS_URL=your_redis_url
SUPABASE_URL=your_supabase_url
```

### Debug Tests
```bash
# Run tests with detailed logging
pnpm test --verbose

# Run specific test with debugging
pnpm test:debug tests/integration/redis/redis.test.ts
```

### Test Coverage
```bash
# Generate coverage report
pnpm test:coverage

# Generate and open coverage report
pnpm test:coverage:open
```

## Common Test Commands

1. **Quick Development Testing**
```bash
pnpm test:watch        # Watch mode for development
```

2. **CI/CD Pipeline Testing**
```bash
pnpm test:ci          # Runs tests in CI environment
```

3. **Cleanup Test Data**
```bash
pnpm test:cleanup    # Cleans up test data
```

## Test Files Location
```
tests/
├── unit/            # Unit tests
├── integration/     # Integration tests
│   ├── redis/      # Redis integration tests
│   ├── db/         # Database integration tests
│   └── websocket/  # WebSocket integration tests
└── e2e/            # End-to-end tests
```

## Adding New Tests

1. **Unit Tests**
- Place in `tests/unit/`
- Name format: `*.test.ts`

2. **Integration Tests**
- Place in `tests/integration/`
- Name format: `*.test.ts`

3. **E2E Tests**
- Place in `tests/e2e/`
- Name format: `*.test.ts`

## Common Issues & Solutions

1. **Redis Connection Issues**
```bash
# Verify Redis connection
pnpm test:redis --verbose
```

2. **Database Connection Issues**
```bash
# Verify Database connection
pnpm test:db --verbose
```

3. **Timeout Issues**
```bash
# Run with increased timeout
pnpm test --testTimeout 10000
```

## Test Scripts in package.json
Reference these scripts in package.json for running tests:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest tests/integration",
    "test:unit": "jest tests/unit",
    "test:e2e": "jest tests/e2e",
    "test:redis": "jest tests/integration/redis --forceExit",
    "test:db": "jest tests/integration/db --forceExit",
    "test:ci": "jest --ci --coverage"
  }
}
```
