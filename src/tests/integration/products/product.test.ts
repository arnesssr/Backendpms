import { describe, it, expect, beforeEach, afterAll, beforeAll } from '@jest/globals';
import axios, { AxiosInstance } from 'axios';
import { db } from '../../../config/database';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

let axiosInstance: AxiosInstance;

beforeAll(() => {
  const httpsAgent = new https.Agent({ keepAlive: false });
  axiosInstance = axios.create({
    timeout: 15000,
    httpsAgent,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    validateStatus: (status) => status < 500
  });
});

describe('Product API Integration Tests', () => {
  const testProduct = {
    name: 'Test Product',
    description: 'Test Description',
    price: '99.99', // Changed to string
    category: 'test-category',
    status: 'draft',
    stock: 10
  };

  beforeEach(async () => {
    try {
      // Reset database before each test
      await db`TRUNCATE TABLE products CASCADE`;
    } catch (error) {
      console.error('Database cleanup failed:', error);
    }
  });

  it('should create a product', async () => {
    const response = await axiosInstance.post(`${API_URL}/api/products`, testProduct);
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
  });

  it('should get all products', async () => {
    const response = await axiosInstance.get(`${API_URL}/api/products`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should update a product', async () => {
    // First create a product
    const createResponse = await axiosInstance.post(`${API_URL}/api/products`, testProduct);
    const productId = createResponse.data.id;

    // Update the product
    const updateResponse = await axiosInstance.put(
      `${API_URL}/api/products/${productId}`,
      { name: 'Updated Product' }
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.name).toBe('Updated Product');
  });

  it('should delete a product', async () => {
    // First create a product
    const createResponse = await axiosInstance.post(`${API_URL}/api/products`, testProduct);
    const productId = createResponse.data.id;

    // Delete the product
    const deleteResponse = await axiosInstance.delete(`${API_URL}/api/products/${productId}`);

    expect(deleteResponse.status).toBe(200);
  });

  it('should publish a product', async () => {
    // Create draft product
    const createResponse = await axiosInstance.post(`${API_URL}/api/products`, testProduct);
    const productId = createResponse.data.id;

    // Publish the product
    const publishResponse = await axiosInstance.post(
      `${API_URL}/api/products/${productId}/publish`,
      {}
    );

    expect(publishResponse.status).toBe(200);
    expect(publishResponse.data.status).toBe('published');
  });

  afterAll(async () => {
    if (axiosInstance) {
      // Clean up axios instance
      axiosInstance.interceptors.request.eject(0);
      axiosInstance.interceptors.response.eject(0);
    }
    await db.end();
    await new Promise(resolve => setTimeout(resolve, 500));
  });
});
