import { describe, it, expect, beforeEach, afterAll, beforeAll } from '@jest/globals';
import axios, { AxiosInstance } from 'axios';
import { db } from '../../../config/database';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

let axiosInstance: AxiosInstance;

beforeAll(() => {
  axiosInstance = axios.create({
    timeout: 5000,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });
});

describe('Product API Tests', () => {
  const testProduct = {
    name: 'Test Product',
    description: 'Test Description',
    price: '99.99', // Change to string for proper decimal handling
    category: 'test-category',
    status: 'draft',
    stock: 10,
    image_urls: []
  };

  // Add product ID storage
  let productId: string;

  beforeEach(async () => {
    await db`TRUNCATE TABLE products CASCADE`;
    // Create a test product for each test that needs it
    const createResponse = await axiosInstance.post(`${API_URL}/api/products`, testProduct);
    productId = createResponse.data.id;
  });

  it('should create a product', async () => {
    const response = await axiosInstance.post(`${API_URL}/api/products`, testProduct);
    productId = response.data.id;
    
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toBe(testProduct.name);
  });

  it('should get a product by id', async () => {
    // Create product first
    const createResponse = await axiosInstance.post(`${API_URL}/api/products`, testProduct);
    const id = createResponse.data.id;

    const response = await axiosInstance.get(`${API_URL}/api/products/${id}`);
    
    expect(response.status).toBe(200);
    expect(response.data.name).toBe(testProduct.name);
  });

  it('should update a product', async () => {
    const updateData = {
      name: 'Updated Product',
      price: '149.99' // Change to string
    };

    const response = await axiosInstance.put(
      `${API_URL}/api/products/${productId}`,
      updateData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data.name).toBe(updateData.name);
    expect(response.data.price).toBe(updateData.price);
  });

  it('should delete a product', async () => {
    const response = await axiosInstance.delete(
      `${API_URL}/api/products/${productId}`,
      {
        headers: {
          'X-API-Key': API_KEY
        }
      }
    );
    
    expect(response.status).toBe(200);

    // Verify deletion
    const getResponse = await axiosInstance.get(`${API_URL}/api/products/${productId}`)
      .catch(error => error.response);
    expect(getResponse.status).toBe(404);
  });

  it('should publish a product', async () => {
    const response = await axiosInstance.post(
      `${API_URL}/api/products/${productId}/publish`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      }
    );
    
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('published');
  });

  afterAll(async () => {
    await db`TRUNCATE TABLE products CASCADE`;
    if (axiosInstance) {
      axiosInstance.interceptors.request.eject(0);
      axiosInstance.interceptors.response.eject(0);
    }
    await db.end();
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
});