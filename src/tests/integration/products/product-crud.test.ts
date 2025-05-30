import { describe, it, expect, beforeEach } from '@jest/globals'
import { db } from '../../../config/database'
import { testClient } from '../../helpers/testClient'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

describe('Product CRUD Tests', () => {
  beforeEach(async () => {
    // Clean product table before each test
    await db`TRUNCATE TABLE products CASCADE`
  })

  const testProduct = {
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    category: 'test-category',
    status: 'draft',
    stock: 10,
    image_urls: ['https://example.com/image.jpg']
  }

  it('should create a product with required fields', async () => {
    const response = await testClient.products.create(testProduct)
    
    console.log('Create Product Test:', {
      requestBody: testProduct,
      responseStatus: response.status,
      responseBody: response.body
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body.name).toBe(testProduct.name)
  })
})
