#!/bin/bash

echo "🚀 Starting optimized build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist

# Single installation step
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Single TypeScript compilation
echo "🔨 Compiling TypeScript..."
pnpm exec tsc

# Environment setup
echo "⚙️ Setting up environment..."
cp .env.example dist/.env

echo "✅ Build completed!"
