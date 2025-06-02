import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import postgres from 'postgres'
import dotenv from 'dotenv'

// Add PostgreSQL error interface
interface PostgresError extends Error {
  code?: string;
  message: string;
}

dotenv.config({ path: '.env.test' })

const DATABASE_URL = process.env.DATABASE_POOL_URL || process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('Database URL not configured')
}

const sql = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  idle_timeout: 20,
  max: 10
})

describe('Products Database Tests', () => {
  const testProduct = {
    name: `Test Product ${Date.now()}`,
    description: 'Test Description',
    price: '99.99',
    category: 'test-category',
    status: 'draft',
    stock: 10,
    image_urls: ['https://example.com/test.jpg']
  }

  beforeAll(async () => {
    try {
      // Add check constraint for positive price
      await sql`
        ALTER TABLE products 
        ADD CONSTRAINT IF NOT EXISTS check_positive_price 
        CHECK (price > 0)
      `;
    } catch (error: unknown) {
      const pgError = error as PostgresError;
      console.log('Setup info:', pgError.message);
    }
  })

  it('should create a product', async () => {
    const [result] = await sql`
      INSERT INTO products ${sql(testProduct)}
      RETURNING *
    `
    expect(result.name).toBe(testProduct.name)
    expect(result.id).toBeTruthy()
  })

  it('should update a product', async () => {
    // First create a product
    const [product] = await sql`
      INSERT INTO products ${sql(testProduct)}
      RETURNING *
    `

    const updateData = {
      name: `Updated Product ${Date.now()}`,
      price: '149.99'
    }

    const [updated] = await sql`
      UPDATE products 
      SET name = ${updateData.name},
          price = ${updateData.price},
          updated_at = NOW()
      WHERE id = ${product.id}
      RETURNING *
    `

    expect(updated.name).toBe(updateData.name)
    expect(updated.price).toBe(updateData.price)
  })

  it('should delete a product', async () => {
    // First create a product
    const [product] = await sql`
      INSERT INTO products ${sql(testProduct)}
      RETURNING *
    `

    await sql`DELETE FROM products WHERE id = ${product.id}`

    const result = await sql`
      SELECT EXISTS(
        SELECT 1 FROM products WHERE id = ${product.id}
      )
    `
    expect(result[0].exists).toBe(false)
  })

  it('should update product stock', async () => {
    const [product] = await sql`
      INSERT INTO products ${sql(testProduct)}
      RETURNING *
    `
    
    const newStock = 20;
    const [updated] = await sql`
      UPDATE products 
      SET stock = ${newStock},
          updated_at = NOW()
      WHERE id = ${product.id}
      RETURNING *
    `
    
    expect(updated.stock).toBe(newStock);
  });

  it('should filter products by status', async () => {
    // Create draft and published products
    await sql`
      INSERT INTO products (name, description, price, category, status, stock, image_urls)
      VALUES 
        ('Draft Product', 'Test', 99.99, 'test', 'draft', 10, ARRAY['test.jpg']),
        ('Published Product', 'Test', 99.99, 'test', 'published', 10, ARRAY['test.jpg'])
    `;

    const publishedProducts = await sql`
      SELECT * FROM products WHERE status = 'published'
    `;

    const draftProducts = await sql`
      SELECT * FROM products WHERE status = 'draft'
    `;

    expect(publishedProducts.length).toBeGreaterThan(0);
    expect(draftProducts.length).toBeGreaterThan(0);
  });

  it('should list products by category', async () => {
    const category = 'test-category';
    await sql`
      INSERT INTO products (name, description, price, category, status, stock, image_urls)
      VALUES ('Category Test', 'Test', 99.99, ${category}, 'published', 10, ARRAY['test.jpg'])
    `;

    const products = await sql`
      SELECT * FROM products WHERE category = ${category}
    `;

    expect(products.length).toBeGreaterThan(0);
    expect(products[0].category).toBe(category);
  });

  afterAll(async () => {
    await sql`TRUNCATE products CASCADE`
    await sql.end()
    await new Promise(resolve => setTimeout(resolve, 1000))
  })
})
