#!/bin/bash

echo "🧪 Setting up test environment..."

# Setup test database
echo "📚 Setting up test database..."
pnpm exec ts-node src/scripts/setupTestDb.ts

# Generate test data
echo "📝 Generating test data..."
pnpm exec ts-node src/scripts/generateTestData.ts

echo "✅ Test environment ready!"
