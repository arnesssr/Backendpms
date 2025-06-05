# API Key Generation Script

This script generates a secure API key for authenticating between PMS and Backend services.

## Running the Script

### Windows
```powershell
# Using PowerShell or Command Prompt
cd backendpms
npx ts-node src/scripts/generateApiKey.ts
```

### Linux/Mac
```bash
# Using Terminal
cd backendpms
npx ts-node src/scripts/generateApiKey.ts
```

## After Generating the Key

1. Copy the generated key
2. Update in backend (.env):
```env
API_KEY=your_generated_key
```

3. Update in PMS (.env):
```env
VITE_API_KEY=your_generated_key
```

## Testing the API Key

### Windows PowerShell
```powershell
# Test endpoint
curl.exe -X GET -H "X-API-Key: your_generated_key" http://localhost:5000/api/test/test-product
```

### Linux/Mac Terminal
```bash
# Test endpoint
curl -X GET http://localhost:5000/api/test/test-product -H "X-API-Key: your_generated_key"
```

### Expected Response
```json
{
  "message": "Test endpoint working",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

If you get a 401 Unauthorized response, double check that:
1. The API key matches in both .env files
2. The X-API-Key header is properly formatted
3. The backend server is running

## Troubleshooting

If you get TypeScript errors:
1. Install ts-node: `npm install -g ts-node`
2. Install typescript: `npm install -g typescript`

If you get permission errors on Linux/Mac:
```bash
chmod +x src/scripts/generateApiKey.ts
./src/scripts/generateApiKey.ts
```

## Security Note
Keep your generated API key secure and never commit it to version control.

# Application Scripts

Development and utility scripts for Backend PMS.

## Directory Structure
```
src/scripts/
├── auth/              # Authentication scripts
│   └── generateApiKey.ts
├── db/               # Database scripts
│   └── seedDatabase.ts
├── test/             # Test utility scripts
│   ├── setupTestDb.ts
│   └── generateTestData.ts
└── index.ts         # Script exports
```

## Usage
```bash
# Generate API Key
pnpm exec ts-node src/scripts/auth/generateApiKey.ts

# Seed Database
pnpm exec ts-node src/scripts/db/seedDatabase.ts

# Setup Test Database
pnpm exec ts-node src/scripts/test/setupTestDb.ts
```
