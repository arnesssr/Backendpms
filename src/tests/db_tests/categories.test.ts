import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const DATABASE_URL = process.env.DATABASE_POOL_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_POOL_URL is not configured')
}

describe('Categories Database Tests', () => {
  let sql: postgres.Sql
  
  beforeAll(async () => {
    // Initialize database connection
    sql = postgres(DATABASE_URL, {
      ssl: { rejectUnauthorized: false },
      idle_timeout: 20,
      max: 1, // Reduce connections
      connect_timeout: 10
    })

    try {
      // Verify connection
      await sql`SELECT 1`
      console.log('✅ Database connected')

      // Create fresh categories table
      await sql`
        DROP TABLE IF EXISTS categories CASCADE;
        CREATE TABLE categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('✅ Categories table created')
    } catch (error) {
      console.error('Setup failed:', error)
      throw error
    }
  })

  it('should verify table exists', async () => {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'categories'
      )`
    expect(result[0].exists).toBe(true)
  })

  it('should insert and read a category', async () => {
    const name = `Test Category ${Date.now()}`
    
    // Insert
    const [inserted] = await sql`
      INSERT INTO categories (name, description)
      VALUES (${name}, 'Test Description')
      RETURNING *
    `
    expect(inserted.name).toBe(name)

    // Read back
    const [found] = await sql`
      SELECT * FROM categories WHERE id = ${inserted.id}
    `
    expect(found.name).toBe(name)
  })

  afterAll(async () => {
    try {
      await sql.end()
      console.log('✅ Database connection closed')
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  })
})
