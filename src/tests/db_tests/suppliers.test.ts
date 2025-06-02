import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const DATABASE_URL = process.env.DATABASE_POOL_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_POOL_URL is not configured')
}

describe('Suppliers Database Tests', () => {
  let sql: postgres.Sql
  
  beforeAll(async () => {
    sql = postgres(DATABASE_URL, {
      ssl: { rejectUnauthorized: false },
      idle_timeout: 20,
      max: 1
    })

    try {
      // Create suppliers table
      await sql`
        CREATE TABLE IF NOT EXISTS suppliers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          phone TEXT,
          address TEXT,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('✅ Suppliers table initialized')
    } catch (error) {
      console.error('Setup failed:', error)
      throw error
    }
  })

  it('should create a supplier', async () => {
    const testSupplier = {
      name: `Test Supplier ${Date.now()}`,
      email: `supplier${Date.now()}@test.com`,
      phone: '1234567890',
      address: 'Test Address'
    }

    const [result] = await sql`
      INSERT INTO suppliers ${sql(testSupplier)}
      RETURNING *
    `
    expect(result.name).toBe(testSupplier.name)
    expect(result.email).toBe(testSupplier.email)
  })

  it('should enforce unique email', async () => {
    const email = `unique${Date.now()}@test.com`
    
    // Create first supplier
    await sql`
      INSERT INTO suppliers (name, email)
      VALUES ('First Supplier', ${email})
    `

    // Try to create duplicate email
    try {
      await sql`
        INSERT INTO suppliers (name, email)
        VALUES ('Second Supplier', ${email})
      `
      fail('Should not allow duplicate email')
    } catch (error: any) {
      expect(error.code).toBe('23505') // Unique violation
    }
  })

  it('should update supplier details', async () => {
    const [supplier] = await sql`
      INSERT INTO suppliers (name, email, phone)
      VALUES ('Test Supplier', 'test@example.com', '1234567890')
      RETURNING *
    `

    const updates = {
      phone: '9876543210',
      address: 'Updated Address'
    }

    const [updated] = await sql`
      UPDATE suppliers 
      SET phone = ${updates.phone},
          address = ${updates.address},
          updated_at = NOW()
      WHERE id = ${supplier.id}
      RETURNING *
    `

    expect(updated.phone).toBe(updates.phone)
    expect(updated.address).toBe(updates.address)
    expect(new Date(updated.updated_at).getTime())
      .toBeGreaterThan(new Date(updated.created_at).getTime())
  })

  it('should filter active suppliers', async () => {
    // Create suppliers with different statuses
    await sql`
      INSERT INTO suppliers (name, status) VALUES
      ('Active Supplier 1', 'active'),
      ('Active Supplier 2', 'active'),
      ('Inactive Supplier', 'inactive')
    `

    const activeSuppliers = await sql`
      SELECT * FROM suppliers WHERE status = 'active'
    `
    expect(activeSuppliers.length).toBeGreaterThan(1)
    activeSuppliers.forEach(supplier => {
      expect(supplier.status).toBe('active')
    })
  })

  it('should search suppliers by name', async () => {
    const searchTerm = 'SearchTest'
    await sql`
      INSERT INTO suppliers (name) VALUES
      (${`${searchTerm} Supplier 1`}),
      (${`${searchTerm} Supplier 2`}),
      ('Other Supplier')
    `

    const results = await sql`
      SELECT * FROM suppliers 
      WHERE name ILIKE ${`%${searchTerm}%`}
    `
    expect(results.length).toBe(2)
    results.forEach(supplier => {
      expect(supplier.name).toContain(searchTerm)
    })
  })

  it('should delete a supplier', async () => {
    // First create a supplier to delete
    const [supplier] = await sql`
      INSERT INTO suppliers (name, email)
      VALUES ('Supplier To Delete', ${`delete-test-${Date.now()}@example.com`})
      RETURNING *
    `

    // Delete the supplier
    await sql`DELETE FROM suppliers WHERE id = ${supplier.id}`

    // Verify supplier is deleted
    const result = await sql`
      SELECT EXISTS(
        SELECT 1 FROM suppliers WHERE id = ${supplier.id}
      )
    `
    expect(result[0].exists).toBe(false)

    // Try to find the deleted supplier
    const deleted = await sql`
      SELECT * FROM suppliers WHERE id = ${supplier.id}
    `
    expect(deleted).toHaveLength(0)
  })

  afterAll(async () => {
    await sql`DROP TABLE IF EXISTS suppliers CASCADE`
    await sql.end()
    await new Promise(resolve => setTimeout(resolve, 1000))
  })
})
