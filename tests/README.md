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
└── e2e/            # End-to-end tests
```

## Running Tests
```bash
# Run all tests
pnpm test

# Run specific tests
pnpm test:unit       # Unit tests
pnpm test:integration # Integration tests
pnpm test:e2e        # E2E tests
```
