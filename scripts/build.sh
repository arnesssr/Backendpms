#!/bin/bash

# Clean old builds
rm -rf dist

# Install dependencies
pnpm install

# Build TypeScript
pnpm run build

# Copy environment template
cp .env.example dist/.env

# Make start script executable
chmod +x scripts/start.sh
