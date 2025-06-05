# Global Scripts

Production and deployment scripts for Backend PMS.

## Directory Structure
```
scripts/
├── build/              # Build scripts
│   ├── build.sh       # Production build
│   └── start.sh       # Production startup
├── setup/             # Setup scripts
│   └── test-setup.sh  # Test environment setup
├── env/               # Environment scripts
│   └── loadEnv.sh     # Environment loader
└── index.sh          # Script registry
```

## Usage
- `./scripts/build/build.sh`: Production build
- `./scripts/build/start.sh`: Start production server
- `./scripts/setup/test-setup.sh`: Setup test environment

## Script Registry
All scripts are registered in index.sh for central management.
