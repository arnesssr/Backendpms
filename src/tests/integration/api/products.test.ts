import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { testClient } from '../../helpers/testClient';
import { db } from '../../../config/database';

describe('Product API Endpoints', () => {
  // Setup test data
  beforeAll(async () => {
    // Clear products table
    await db`DELETE FROM products`;
    
    // Insert test product
    const testProduct = {
      name: 'Initial Test Product',
      price: 99.99,
      description: 'Test Description',
      category: 'test',
      status: 'published'
    };
    
    await db`
      INSERT INTO products ${db(testProduct)}
      RETURNING *
    `;
  });

  // Clean up
  afterAll(async () => {
    await db`DELETE FROM products`;
  });

  const newProduct = {
    name: 'Test Product',
    price: 99.99,
    description: 'Test Description',
    category: 'test',
    status: 'draft'
  };

  let createdProductId: string;

  it('should create a new product', async () => {
    const response = await testClient.products.create(newProduct);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    createdProductId = response.body.id; // Store the ID
    console.log('Created product ID:', createdProductId); // Debug log
  });

  it('should get all products', async () => {
    const response = await testClient.products.getAll();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    // Now this should pass since we have at least one product
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should get a single product', async () => {
    expect(createdProductId).toBeDefined(); // Verify ID exists
    const response = await testClient.products.getOne(createdProductId);
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdProductId);
  });

  it('should update a product', async () => {
    expect(createdProductId).toBeDefined();
    
    const update = {
      name: 'Updated Product Name',
      price: 199.99
    };

    const response = await testClient.products.update(createdProductId, update);
    
    expect(response.status).toBe(200);
    expect(response.body.name).toBe(update.name);
    // Fix the price comparison
    expect(Number(response.body.price)).toBe(update.price);
  });

  it('should delete a product', async () => {
    const response = await testClient.products.delete(createdProductId)
    expect(response.status).toBe(200)

    // Verify deletion
    const getResponse = await testClient.products.getOne(createdProductId)
    expect(getResponse.status).toBe(404)
  })
})
