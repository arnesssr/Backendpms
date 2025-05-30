import { db } from '../../config/database'
import { supabase } from '../../services/supabaseService'
import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

describe('Database Connection Tests', () => {
  beforeAll(async () => {
    // Wait for table creation
    await new Promise(resolve => setTimeout(resolve, 1000))
  })

  it('should verify postgres database connection', async () => {
    const result = await db`SELECT 1 + 1 as sum`
    expect(result[0].sum).toBe(2)
  })

  it('should verify supabase connection', async () => {
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    expect(error).toBeNull()
  })

  it('should verify products table exists', async () => {
    const result = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      )`
    expect(result[0].exists).toBe(true)
  })

  it('should be able to insert and query data', async () => {
    // Insert test data
    const testProduct = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'test',
      stock: 10
    }

    const [inserted] = await db`
      INSERT INTO products ${db(testProduct)}
      RETURNING *`

    expect(inserted.name).toBe(testProduct.name)

    // Query the inserted data
    const [found] = await db`
      SELECT * FROM products 
      WHERE id = ${inserted.id}`

    expect(found).toBeDefined()
    expect(found.name).toBe(testProduct.name)
  })
})
