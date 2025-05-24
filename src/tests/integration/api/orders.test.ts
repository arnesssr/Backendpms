import { describe, it, expect, beforeAll } from '@jest/globals';
import { testClient } from '../../helpers/testClient';
import { db } from '../../../config/database';

describe('Order API Endpoints', () => {
  let productId: string;
  let orderId: string;

  beforeAll(async () => {
    // Create test product
    const [product] = await db`
      INSERT INTO products (name, price, status)
      VALUES ('Test Product', 99.99, 'published')
      RETURNING id
    `;
    productId = product.id;
  });

  it('should create a new order', async () => {
    const orderData = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      total: 199.98,
      items: [
        {
          productId,
          quantity: 2,
          price: 99.99
        }
      ]
    };

    const response = await testClient.orders.create(orderData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    orderId = response.body.id;
  });

  it('should get order details', async () => {
    const response = await testClient.orders.getOne(orderId);
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(orderId);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.total).toBe(199.98);
  });

  it('should update order status', async () => {
    const response = await testClient.orders.updateStatus(orderId, {
      status: 'processing'
    });
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('processing');
  });

  it('should list all orders', async () => {
    const response = await testClient.orders.getAll();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
