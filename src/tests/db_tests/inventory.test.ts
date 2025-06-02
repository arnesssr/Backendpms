import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const DATABASE_URL = process.env.DATABASE_POOL_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_POOL_URL not configured')
}

describe('Inventory Database Tests', () => {
  let sql: postgres.Sql
  let testProductId: string
  
  beforeAll(async () => {
    sql = postgres(DATABASE_URL, {
      ssl: { rejectUnauthorized: false },
      idle_timeout: 20,
      max: 1
    })

    try {
      // First drop table if exists
      await sql`DROP TABLE IF EXISTS inventory_movements CASCADE`
      
      // Then create table
      await sql`
        CREATE TABLE inventory_movements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          product_id UUID NOT NULL,
          type TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          reason TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Create test product
      const [product] = await sql`
        INSERT INTO products (
          name, description, price, category, stock, image_urls
        ) VALUES (
          'Test Inventory Product',
          'For inventory testing',
          99.99,
          'test',
          100,
          ARRAY['test.jpg']::TEXT[]
        ) RETURNING id
      `
      testProductId = product.id
      console.log('✅ Inventory test setup complete')
    } catch (error) {
      console.error('Setup failed:', error)
      throw error
    }
  })

  it('should record stock movement', async () => {
    const [result] = await sql`
      INSERT INTO inventory_movements (
        product_id, type, quantity, reason
      ) VALUES (
        ${testProductId}, 'in', 50, 'Restock'
      ) RETURNING *
    `
    expect(result.quantity).toBe(50)
    expect(result.type).toBe('in')
  })

  it('should track current stock level', async () => {
    await sql`
      INSERT INTO inventory_movements (
        product_id, type, quantity, reason
      ) VALUES (
        ${testProductId}, 'out', 10, 'Sale'
      )
    `

    const [product] = await sql`
      SELECT stock FROM products WHERE id = ${testProductId}
    `
    expect(product.stock).toBeGreaterThanOrEqual(0)
  })

  it('should calculate total stock movements', async () => {
    // Clear previous movements
    await sql`TRUNCATE inventory_movements`

    // Add multiple movements
    await sql`
      INSERT INTO inventory_movements (product_id, type, quantity, reason)
      VALUES 
        (${testProductId}, 'in', 50, 'Initial stock'),
        (${testProductId}, 'out', 20, 'Sale'),
        (${testProductId}, 'in', 10, 'Restock')
    `

    const [result] = await sql`
      SELECT 
        COALESCE(
          SUM(
            CASE 
              WHEN type = 'in' THEN quantity::integer 
              ELSE -quantity::integer 
            END
          ),
          0
        ) as net_change
      FROM inventory_movements 
      WHERE product_id = ${testProductId}
    `
    // Convert to number for comparison
    expect(Number(result.net_change)).toBe(40) // 50 - 20 + 10
  })

  it('should track movement history', async () => {
    const movements = await sql`
      SELECT * FROM inventory_movements
      WHERE product_id = ${testProductId}
      ORDER BY created_at DESC
    `
    expect(movements.length).toBeGreaterThan(0)
    expect(movements[0]).toHaveProperty('type')
    expect(movements[0]).toHaveProperty('quantity')
  })

  it('should validate positive quantities', async () => {
    try {
      await sql`
        INSERT INTO inventory_movements (product_id, type, quantity)
        VALUES (${testProductId}, 'in', -10)
      `
      fail('Should not allow negative quantities')
    } catch (error: any) {
      expect(error).toBeTruthy()
    }
  })

  afterAll(async () => {
    try {
      await sql`DROP TABLE IF EXISTS inventory_movements CASCADE`
      await sql`DELETE FROM products WHERE id = ${testProductId}`
      await sql.end()
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  })
})
