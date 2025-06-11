# Test Suite Documentation

## Directory Structure
```
tests/
├── integration/       # Integration tests
│   ├── redis/        # Redis integration
│   ├── db/          # Database integration
│   └── api/         # API integration
├── unit/            # Unit tests
│   ├── services/    # Service tests
│   └── utils/       # Utility tests
├── e2e/            # End-to-end tests
└── production/      # Production environment tests
    ├── backend/     # Backend availability tests
    ├── pms/        # PMS integration tests
    └── storefront/ # Storefront integration tests
```

## Common Issues

### TLSWRAP Open Handles
Jest may detect TLSWRAP open handles when running tests with axios requests. This happens when network connections aren't properly closed.

**Solution:**
```typescript
// Use AbortController for request cancellation
const controller = new AbortController();
const response = await axios.get(url, { signal: controller.signal });

// Clean up in afterEach
afterEach(() => {
  controller.abort();
});

// Add delay in afterAll to ensure connections close
afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
});
```

**Example Implementation:**
See `tests/production/backend/health.test.ts` for a working example.

## Running Tests
```bash
# Run all tests
pnpm test

# Run specific tests
pnpm test:unit       # Unit tests
pnpm test:integration # Integration tests
pnpm test:e2e        # E2E tests
pnpm test:prod       # Production tests
```
