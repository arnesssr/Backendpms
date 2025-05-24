import { describe, it, expect, beforeAll } from '@jest/globals';
import { testClient } from '../../helpers/testClient';
import { db } from '../../../config/database';

describe('Inventory API Endpoints', () => {
  let productId: string;

  beforeAll(async () => {
    // Create test product and initial stock movement
    const [product] = await db`
      INSERT INTO products (name, price, status)
      VALUES ('Test Product', 99.99, 'published')
      RETURNING id
    `;
    productId = product.id;

    // Create initial stock movement
    await db`
      INSERT INTO stock_movements (
        product_id,
        type,
        quantity,
        notes
      ) VALUES (
        ${productId},
        'in',
        100,
        'Initial stock'
      )
    `;
  });

  it('should get product stock', async () => {
    const response = await testClient.inventory.getStock(productId);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('stock');
  });

  it('should update stock level', async () => {
    const response = await testClient.inventory.updateStock(productId, { stock: 100 });
    expect(response.status).toBe(200);
    expect(response.body.stock).toBe(100);
  });

  it('should track stock movement', async () => {
    const movement = { 
      type: 'in',
      quantity: 50,
      notes: 'Stock replenishment'
    };
    const response = await testClient.inventory.addMovement(productId, movement);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should get stock movements', async () => {
    // First verify product exists
    const product = await db`
      SELECT * FROM products WHERE id = ${productId}
    `;
    console.log('Test product:', product);

    // Verify movement exists
    const movement = await db`
      SELECT * FROM stock_movements WHERE product_id = ${productId}
    `;
    console.log('Test movement:', movement);

    const response = await testClient.inventory.getMovements(productId);
    
    if (response.status !== 200) {
      console.log('Error response:', response.body);
    }

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  it('should get low stock alerts', async () => {
    const response = await testClient.inventory.getLowStockAlerts();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });
});
