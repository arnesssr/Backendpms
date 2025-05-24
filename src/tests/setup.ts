import { jest, beforeAll, afterAll } from '@jest/globals';
import dotenv from 'dotenv';
import { db } from '../config/database';
import { app } from '../app';
import http from 'http';

dotenv.config({ path: '.env.test' });

let server: http.Server;
let connection: typeof db | null = null;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '5001';
  
  try {
    // First drop tables if they exist to ensure clean state
    await db`DROP TABLE IF EXISTS order_items CASCADE`;
    await db`DROP TABLE IF EXISTS orders CASCADE`;

    // Create orders table
    await db`
      CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create order items table
    await db`
      CREATE TABLE order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Clear all test data
    await db`TRUNCATE stock_movements, inventory, products, categories CASCADE`;
    
    console.log('Test database connected and cleaned');
    server = app.listen(process.env.PORT);
  } catch (error) {
    console.error('Test setup failed:', error);
    process.exit(1);
  }
}, 60000);

afterAll(async () => {
  if (connection) {
    await connection.end({ timeout: 10000 });
    connection = null;
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
}, 60000);

declare global {
  var testDb: typeof db;
}

global.testDb = db;
