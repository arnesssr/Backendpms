import dotenv from 'dotenv';
import { cleanEnv, str, num } from 'envalid';

// Load .env file
dotenv.config();

// Validate and export environment variables
export const env = cleanEnv(process.env, {
  // Database
  DATABASE_URL: str(),
  DATABASE_POOL_URL: str(),

  // Clerk Auth
  CLERK_SECRET_KEY: str(),
  CLERK_JWT_KEY: str(),

  // Supabase
  SUPABASE_URL: str(),
  SUPABASE_KEY: str(),
  SUPABASE_SERVICE_ROLE_KEY: str(),

  // API Config
  API_KEY: str(),
  PORT: num({ default: 3000 }),

  // Logging
  LOG_LEVEL: str({ default: 'info' }),

  // Environment
  NODE_ENV: str({ default: 'development' }),
});
