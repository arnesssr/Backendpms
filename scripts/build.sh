#!/bin/bash

echo "🚀 Starting optimized build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist

# Install dependencies without frozen lockfile
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Ensure Redis dependencies
echo "📦 Installing Redis dependencies..."
pnpm add @redis/client

# Build TypeScript
echo "🔨 Compiling TypeScript..."
pnpm exec tsc --project tsconfig.json

# Copy environment template
echo "⚙️ Setting up environment..."
cp .env.example dist/.env 2>/dev/null || :

echo "✅ Build completed!"
