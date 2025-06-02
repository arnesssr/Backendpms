import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const DATABASE_URL = process.env.DATABASE_POOL_URL || process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('Database URL not configured')
}

const sql = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  idle_timeout: 20,
  max: 10,
  connection: {
    application_name: 'pms_test'
  }
})

describe('Database Connection Tests', () => {
  beforeAll(async () => {
    try {
      // Create products table if not exists
      await sql`
        CREATE TABLE IF NOT EXISTS products (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          category TEXT NOT NULL,
          status TEXT DEFAULT 'draft',
          stock INTEGER DEFAULT 0,
          image_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('✅ Products table initialized')
    } catch (error) {
      console.error('❌ Table creation failed:', error)
      throw error
    }
  })

  it('should connect to Supabase database', async () => {
    try {
      const result = await sql`SELECT NOW()`
      console.log('Database connection successful:', result[0].now)
      expect(result[0].now).toBeTruthy()
    } catch (error) {
      console.error('Connection failed:', error)
      throw error
    }
  })

  it('should verify products table exists', async () => {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      )`
    expect(result[0].exists).toBe(true)
  })

  it('should verify categories table exists', async () => {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
      )`
    expect(result[0].exists).toBe(true)
  })

  it('should verify products table structure', async () => {
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `
    expect(result.length).toBeGreaterThan(0)
    expect(result.some(col => col.column_name === 'image_urls')).toBe(true)
  })

  afterAll(async () => {
    await sql.end()
    await new Promise(resolve => setTimeout(resolve, 1000))
  })
})
