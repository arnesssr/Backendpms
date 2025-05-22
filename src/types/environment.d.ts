declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      PORT: string
      SUPABASE_URL: string
      SUPABASE_KEY: string
      API_KEY: string
      // Add other environment variables you're using
    }
  }
}

export {}
