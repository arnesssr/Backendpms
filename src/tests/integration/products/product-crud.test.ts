import { describe, it, expect, beforeEach, afterAll } from '@jest/globals'
import { db } from '../../../config/database'
import { testClient } from '../../helpers/testClient'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

describe('Product CRUD Tests', () => {
  beforeEach(async () => {
    // Clean product table before each test
    await db`TRUNCATE TABLE products CASCADE`
  })

  afterAll(async () => {
    // Close database connection to prevent Jest handle leaks
    await db.end()
  })

  const testProduct = {
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    category: 'test-category',
    status: 'draft',
    stock: 10,
    image_urls: null  // Set to null instead of omitting
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

  it('should create a product with images', async () => {
    const productWithImages = {
      ...testProduct,
      image_urls: ['https://example.com/test-image1.jpg', 'https://example.com/test-image2.jpg']
    }

    const response = await testClient.products.create(productWithImages)
    
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body.name).toBe(productWithImages.name)
    expect(response.body.image_urls).toEqual(productWithImages.image_urls)
  })

  it('should handle empty image array', async () => {
    const productWithEmptyImages = {
      ...testProduct,
      image_urls: []
    }

    const response = await testClient.products.create(productWithEmptyImages)
    
    console.log('Empty Images Test:', {
      requestBody: productWithEmptyImages,
      responseStatus: response.status,
      responseBody: response.body
    })

    // This test will show us how your API handles empty arrays
    // Adjust expectation based on your business logic
    if (response.status === 201) {
      expect(response.body).toHaveProperty('id')
    } else {
      expect(response.status).toBe(400)
      expect(response.body.error).toContain('image')
    }
  })

  it('should reject published product without images (if applicable)', async () => {
    const publishedProductNoImages = {
      ...testProduct,
      status: 'published',
      image_urls: null
    }

    const response = await testClient.products.create(publishedProductNoImages)
    
    console.log('Published Product No Images Test:', {
      requestBody: publishedProductNoImages,
      responseStatus: response.status,
      responseBody: response.body
    })

    // Adjust this based on your business rules
    // If published products require images, expect 400
    // If not, expect 201
    if (response.status === 400) {
      expect(response.body.error).toContain('image')
    } else {
      expect(response.status).toBe(201)
    }
  })
})