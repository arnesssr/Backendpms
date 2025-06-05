#!/bin/bash
# Remove old lockfile and node_modules
rm -rf pnpm-lock.yaml node_modules

# Fresh install without frozen lockfile
pnpm install

# Build the project
pnpm run build
