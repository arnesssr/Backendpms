#!/bin/bash

echo "🚀 Starting optimized build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist

# Install dependencies without frozen lockfile
echo "📦 Installing dependencies..."
pnpm install --no-frozen-lockfile

# Ensure Redis dependencies
echo "📦 Installing Redis dependencies..."
pnpm add ioredis@5.6.1

# Build TypeScript
echo "🔨 Compiling TypeScript..."
pnpm exec tsc

# Copy environment template
echo "⚙️ Setting up environment..."
cp .env.example dist/.env

echo "✅ Build completed!"
