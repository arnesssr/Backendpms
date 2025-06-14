import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { app, httpServer } from '../../../src/app';
import { redis } from '../../../src/config/redis';
import { WebhookQueue } from '../../../src/services/webhookQueueService';

describe('Product Creation Tests', () => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      httpServer.listen(3000, () => {
        console.log('Test server started');
        resolve();
      });
    });
  }, 30000); // Increased timeout

  afterAll(async () => {
    try {
      if (redis.isOpen) await redis.quit();
      await WebhookQueue.getInstance().cleanup();
      await new Promise<void>((resolve) => {
        httpServer.close(() => resolve());
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, 30000); // Increased timeout

  it('should create product and initialize inventory', async () => {
    // Create test product
    const product = {
      name: 'Test Product Auto Inventory',
      description: 'Testing automatic inventory creation',
      price: 29.99,
      category: 'test'
    };

    // Make API request
    const response = await axios.post('http://localhost:3000/api/pms/products', product, {
      headers: { 'x-api-key': process.env.API_KEY }
    });

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    
    // Verify product creation
    const productId = response.data.data.product.id;
    const { data: createdProduct } = await supabase
      .from('products')
      .select()
      .eq('id', productId)
      .single();
    
    expect(createdProduct).toBeTruthy();
    expect(createdProduct.name).toBe(product.name);

    // Verify inventory creation
    const { data: inventory } = await supabase
      .from('inventory')
      .select()
      .eq('product_id', productId)
      .single();
    
    expect(inventory).toBeTruthy();
    expect(inventory.quantity).toBe(0);
    expect(inventory.status).toBe('out_of_stock');
  }, 30000); // Increased timeout
});
