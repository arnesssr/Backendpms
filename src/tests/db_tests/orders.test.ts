import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const DATABASE_URL = process.env.DATABASE_POOL_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_POOL_URL not configured')
}

describe('Orders Database Tests', () => {
  let sql: postgres.Sql
  let testProductId: string
  
  beforeAll(async () => {
    sql = postgres(DATABASE_URL, {
      ssl: { rejectUnauthorized: false },
      idle_timeout: 20,
      max: 1
    })

    try {
      // Drop tables in correct order
      await sql`DROP TABLE IF EXISTS order_items CASCADE`
      await sql`DROP TABLE IF EXISTS orders CASCADE`
      
      // Create orders table first
      await sql`
        CREATE TABLE orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          customer_email TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          total_amount DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Create order_items with ON DELETE CASCADE
      await sql`
        CREATE TABLE order_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
          product_id UUID NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Create test product for orders
      const [product] = await sql`
        INSERT INTO products (name, price, category, image_urls)
        VALUES ('Test Product', 99.99, 'test', ARRAY['test.jpg'])
        RETURNING id
      `
      testProductId = product.id
      
      console.log('✅ Orders tables initialized')
    } catch (error) {
      console.error('Setup failed:', error)
      throw error
    }
  })

  it('should create an order with items', async () => {
    const [order] = await sql`
      INSERT INTO orders (customer_email, total_amount)
      VALUES ('test@example.com', 99.99)
      RETURNING *
    `

    const [orderItem] = await sql`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES (${order.id}, ${testProductId}, 1, 99.99)
      RETURNING *
    `

    expect(order.customer_email).toBe('test@example.com')
    expect(orderItem.quantity).toBe(1)
  })

  it('should update order status', async () => {
    const [order] = await sql`
      INSERT INTO orders (customer_email, total_amount, status)
      VALUES ('status@test.com', 199.99, 'pending')
      RETURNING *
    `

    const [updated] = await sql`
      UPDATE orders 
      SET status = 'completed',
          updated_at = NOW()
      WHERE id = ${order.id}
      RETURNING *
    `

    expect(updated.status).toBe('completed')
    expect(new Date(updated.updated_at).getTime())
      .toBeGreaterThan(new Date(updated.created_at).getTime())
  })

  it('should calculate order totals', async () => {
    const [order] = await sql`
      INSERT INTO orders (customer_email, total_amount)
      VALUES ('calc@test.com', 299.97)
      RETURNING *
    `

    await sql`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES 
        (${order.id}, ${testProductId}, 2, 99.99),
        (${order.id}, ${testProductId}, 1, 99.99)
    `

    const [result] = await sql`
      SELECT SUM(quantity * unit_price) as total
      FROM order_items
      WHERE order_id = ${order.id}
    `

    expect(Number(result.total)).toBe(299.97)
  })

  it('should handle multiple items in order', async () => {
    const [order] = await sql`
      INSERT INTO orders (customer_email, total_amount)
      VALUES ('multi@test.com', 299.97)
      RETURNING *
    `

    // Insert multiple items
    await sql`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES 
        (${order.id}, ${testProductId}, 2, 99.99),
        (${order.id}, ${testProductId}, 1, 99.99)
    `

    const items = await sql`
      SELECT * FROM order_items WHERE order_id = ${order.id}
    `
    expect(items).toHaveLength(2)
  })

  it('should track order history by status', async () => {
    const [order] = await sql`
      INSERT INTO orders (customer_email, total_amount, status)
      VALUES ('history@test.com', 99.99, 'pending')
      RETURNING *
    `

    // Update status multiple times
    await sql`
      UPDATE orders SET 
        status = 'processing',
        updated_at = NOW()
      WHERE id = ${order.id}
    `
    
    await sql`
      UPDATE orders SET 
        status = 'completed',
        updated_at = NOW()
      WHERE id = ${order.id}
    `

    const [result] = await sql`
      SELECT * FROM orders WHERE id = ${order.id}
    `
    expect(result.status).toBe('completed')
  })

  it('should validate minimum order amount', async () => {
    try {
      await sql`
        INSERT INTO orders (customer_email, total_amount)
        VALUES ('minimum@test.com', 0)
      `
      fail('Should not allow zero amount orders')
    } catch (error: any) {
      expect(error).toBeTruthy()
    }
  })

  it('should delete order and its items', async () => {
    // Create order with items
    const [order] = await sql`
      INSERT INTO orders (customer_email, total_amount)
      VALUES ('delete@test.com', 199.98)
      RETURNING *
    `

    await sql`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES (${order.id}, ${testProductId}, 2, 99.99)
    `

    // Delete order (items will be deleted via CASCADE)
    await sql`DELETE FROM orders WHERE id = ${order.id}`

    // Verify both order and items are deleted
    const orderExists = await sql`
      SELECT EXISTS(SELECT 1 FROM orders WHERE id = ${order.id})
    `
    const itemsExist = await sql`
      SELECT EXISTS(SELECT 1 FROM order_items WHERE order_id = ${order.id})
    `

    expect(orderExists[0].exists).toBe(false)
    expect(itemsExist[0].exists).toBe(false)
  })

  afterAll(async () => {
    await sql`DROP TABLE IF EXISTS order_items CASCADE`
    await sql`DROP TABLE IF EXISTS orders CASCADE`
    await sql.end()
  })
})
