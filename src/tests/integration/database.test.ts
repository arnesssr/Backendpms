import { describe, it, expect } from '@jest/globals'
import { supabase } from '../../services/supabaseService'

describe('Database Connection Tests', () => {
  it('should connect to postgres database', async () => {
    const result = await global.testDb`SELECT 1 as connected`
    expect(result[0].connected).toBe(1)
  }, 30000)

  it('should connect to supabase', async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    expect(error).toBeNull()
  }, 30000)
})

describe('Database CRUD Operations', () => {
  const testProduct = {
    name: 'Test Product',
    price: 99.99,
    description: 'Test Description',
    category: 'test',
    status: 'draft',
    stock: 10
  }

  it('should perform CRUD operations', async () => {
    // Create
    const inserted = await global.testDb`
      INSERT INTO products ${global.testDb(testProduct)} 
      RETURNING *
    `
    expect(inserted[0].name).toBe(testProduct.name)
    
    const productId = inserted[0].id

    // Read
    const read = await global.testDb`
      SELECT * FROM products WHERE id = ${productId}
    `
    expect(read[0].name).toBe(testProduct.name)

    // Update
    const updated = await global.testDb`
      UPDATE products 
      SET name = ${'Updated Name'} 
      WHERE id = ${productId}
      RETURNING *
    `
    expect(updated[0].name).toBe('Updated Name')

    // Delete
    await global.testDb`DELETE FROM products WHERE id = ${productId}`
    const deleted = await global.testDb`
      SELECT * FROM products WHERE id = ${productId}
    `
    expect(deleted.length).toBe(0)
  }, 30000)
})
