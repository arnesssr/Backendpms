import axios from 'axios';
import { axiosInstance } from '../../../utils/axiosInstance';

// Test product with required image_urls field
const testProduct = {
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  category: 'Test Category',
  stock: 10,
  image_urls: ['https://example.com/image.jpg'] // REQUIRED FIELD ADDED
};

describe('Product API Tests', () => {
  test('should create a product', async () => {
    const response = await axiosInstance.post('/api/products', testProduct);
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
  }, 30000);

  test('should get products', async () => {
    const response = await axiosInstance.get('/api/products');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('should get product by id', async () => {
    const createRes = await axiosInstance.post('/api/products', testProduct);
    const response = await axiosInstance.get(`/api/products/${createRes.data.id}`);
    expect(response.status).toBe(200);
    expect(response.data.name).toBe(testProduct.name);
  });

  test('should update product', async () => {
    const createRes = await axiosInstance.post('/api/products', testProduct);
    const updateData = { name: 'Updated Product' };
    const response = await axiosInstance.put(
      `/api/products/${createRes.data.id}`,
      updateData
    );
    expect(response.status).toBe(200);
    expect(response.data.name).toBe(updateData.name);
  });

  test('should delete product', async () => {
    const createRes = await axiosInstance.post('/api/products', testProduct);
    const deleteRes = await axiosInstance.delete(`/api/products/${createRes.data.id}`);
    expect(deleteRes.status).toBe(200);
    
    // Verify deletion
    try {
      await axiosInstance.get(`/api/products/${createRes.data.id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(404);
      }
    }
  });
  
  test('should create product with image upload', async () => {
    const productData = {
      ...testProduct,
      image_urls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
    };
    const response = await axiosInstance.post('/api/products', productData);
    expect(response.status).toBe(201);
    expect(response.data.image_urls).toEqual(expect.arrayContaining(productData.image_urls));
  });

  test('should update product with inventory sync', async () => {
    const createRes = await axiosInstance.post('/api/products', testProduct);
    const updateData = { stock: 20 };
    const response = await axiosInstance.put(
      `/api/products/${createRes.data.id}`,
      updateData
    );
    expect(response.status).toBe(200);
    expect(response.data.stock).toBe(updateData.stock);
  });

  test('should delete product with inventory cleanup', async () => {
    const createRes = await axiosInstance.post('/api/products', testProduct);
    const deleteRes = await axiosInstance.delete(`/api/products/${createRes.data.id}`);
    expect(deleteRes.status).toBe(200);
    
    // Verify inventory cleanup
    const inventoryResponse = await axiosInstance.get('/api/inventory');
    expect(inventoryResponse.status).toBe(200);
    expect(inventoryResponse.data).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ productId: createRes.data.id })
    ]));
  });

  test('should transition product status', async () => {
    const createRes = await axiosInstance.post('/api/products', testProduct);
    const updateData = { status: 'inactive' };
    const response = await axiosInstance.put(
      `/api/products/${createRes.data.id}`,
      updateData
    );
    expect(response.status).toBe(200);
    expect(response.data.status).toBe(updateData.status);
  });

  test('should associate product with category', async () => {
    const createRes = await axiosInstance.post('/api/products', testProduct);
    const categoryData = { name: 'New Category' };
    const categoryRes = await axiosInstance.post('/api/categories', categoryData);
    
    const response = await axiosInstance.put(
      `/api/products/${createRes.data.id}`,
      { category: categoryRes.data.id }
    );
    expect(response.status).toBe(200);
    expect(response.data.category).toBe(categoryRes.data.id);
  });
});