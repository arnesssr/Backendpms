declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Environment
      NODE_ENV: 'development' | 'production' | 'test'
      PORT: string

      // Database Connections
      DATABASE_URL: string
      DATABASE_POOL_URL: string

      // Supabase
      SUPABASE_URL: string
      SUPABASE_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string

      // Clerk Authentication
      CLERK_SECRET_KEY: string
      CLERK_JWT_KEY: string

      // API Keys & Secrets
      API_KEY: string
      JWT_SECRET: string

      // Cloudinary
      CLOUDINARY_CLOUD_NAME: string
      CLOUDINARY_API_KEY: string
      CLOUDINARY_API_SECRET: string
      API_ENVRONMENT_VARIABLE: string

      // Logging
      LOG_LEVEL: string
    }
  }
}

export {}
