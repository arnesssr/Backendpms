# Backend Tests Documentation

## Current Progress
✅ Database Tests: All 4 tests passing
⏳ Product Tests: In progress
⏳ Integration Tests: Not started

## Test Structure
```
src
└── tests
    ├── database
    │   └── database.test.ts
    ├── integration
    │   └── integration.test.ts
    └── products
        └── products.test.ts
```

## Test Environment Setup
1. Create `.env.test` with required credentials:
```env
SUPABASE_URL=your_test_supabase_url
SUPABASE_KEY=your_test_key
DATABASE_URL=your_test_db_url
API_KEY=your_test_api_key
```

## Database Tests
Located in: `src/tests/database/database.test.ts`

### Running Database Tests
```bash
pnpm test src/tests/database/database.test.ts
```

### Test Cases
1. Database Connection Test
   - Verifies basic PostgreSQL connection
   - Checks query execution
   
2. Supabase Connection Test
   - Verifies Supabase client connection
   - Tests data access permissions

3. Schema Validation Test
   - Verifies existence of required tables:
     - products
     - categories
     - inventory

### Common Issues
1. Connection Failures
   - Check .env.test credentials
   - Verify VPN/network access
   - Confirm Supabase service status

2. Schema Errors
   - Run migrations: `pnpm migrate`
   - Check table permissions

## Running Order
1. Database Tests (MUST PASS FIRST)
2. Integration Tests
3. Product Tests
