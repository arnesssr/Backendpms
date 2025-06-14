#!/bin/bash

echo "🚀 Starting optimized build process..."

echo "🧹 Cleaning previous builds..."
rm -rf dist

echo "📦 Installing dependencies..."
# Remove --frozen-lockfile to allow updates
pnpm install

echo "🔨 Compiling TypeScript..."
# Add explicit reference to types
pnpm exec tsc --project tsconfig.json

echo "⚙️ Setting up environment..."
cp .env.example dist/.env 2>/dev/null || :

echo "✅ Build completed!"
