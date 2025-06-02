import { describe, it, expect } from '@jest/globals';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.API_URL, // Your Render URL
  timeout: 15000, // Longer timeout for network requests
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.API_KEY
  }
});

describe('PMS Backend API - Production Health', () => {
  // Safe read-only tests
  it('should connect to API successfully', async () => {
    const response = await api.get('/health');
    expect(response.status).toBe(200);
  });

  it('should authenticate successfully', async () => {
    const response = await api.get('/api/auth/verify');
    expect(response.status).toBe(200);
  });

  // Safe write operations with cleanup
  it('should create and delete test category', async () => {
    const testCategory = {
      name: `TEST_CATEGORY_${Date.now()}`,
      description: 'Automated test - will be deleted'
    };

    // Create
    const createResponse = await api.post('/api/categories', testCategory);
    expect(createResponse.status).toBe(201);
    
    const categoryId = createResponse.data.id;

    // Verify
    const getResponse = await api.get(`/api/categories/${categoryId}`);
    expect(getResponse.data.name).toBe(testCategory.name);

    // Cleanup - Delete
    const deleteResponse = await api.delete(`/api/categories/${categoryId}`);
    expect(deleteResponse.status).toBe(200);
  }, 30000); // Longer timeout for network operations

  // Category Integration Tests
  it('should create category with validation', async () => {
    const response = await api.post('/api/categories', {
      name: 'Valid Category',
      description: 'Category with valid data'
    });
    expect(response.status).toBe(201);
  });

  it('should update category with status changes', async () => {
    const categoryId = 'existing-category-id'; // Replace with a real category ID
    const response = await api.patch(`/api/categories/${categoryId}`, {
      status: 'inactive'
    });
    expect(response.status).toBe(200);
  });

  it('should delete category with product associations', async () => {
    const categoryId = 'category-with-products-id'; // Replace with a real category ID
    const response = await api.delete(`/api/categories/${categoryId}`);
    expect(response.status).toBe(200);
  });

  it('should get category with products', async () => {
    const categoryId = 'category-with-products-id'; // Replace with a real category ID
    const response = await api.get(`/api/categories/${categoryId}?include=products`);
    expect(response.status).toBe(200);
    expect(response.data.products).toBeDefined();
  });

  it('should perform category hierarchy operations', async () => {
    const response = await api.post('/api/categories/merge', {
      primaryCategoryId: 'primary-category-id', // Replace with real ID
      secondaryCategoryId: 'secondary-category-id' // Replace with real ID
    });
    expect(response.status).toBe(200);
  });
});