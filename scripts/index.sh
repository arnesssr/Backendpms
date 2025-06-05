#!/bin/bash

# Script registry
SCRIPTS=(
  "build/build.sh"
  "build/start.sh"
  "setup/test-setup.sh"
  "env/loadEnv.sh"
)

# Script documentation
declare -A SCRIPT_DOCS
SCRIPT_DOCS["build/build.sh"]="Production build script"
SCRIPT_DOCS["build/start.sh"]="Production startup script"
SCRIPT_DOCS["setup/test-setup.sh"]="Test environment setup"
SCRIPT_DOCS["env/loadEnv.sh"]="Environment loader"

# Load all scripts
for script in "${SCRIPTS[@]}"; do
  if [ -f "./scripts/$script" ]; then
    source "./scripts/$script"
  fi
done
