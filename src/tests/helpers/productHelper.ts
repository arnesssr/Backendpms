import axios from 'axios';
import { db } from '../../config/database';

export const productHelper = {
  async cleanupProducts() {
    await db`TRUNCATE TABLE products CASCADE`;
  },

  async createTestProduct(overrides = {}) {
    const defaultProduct = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'test-category',
      status: 'draft'
    };

    const product = { ...defaultProduct, ...overrides };
    const [created] = await db`
      INSERT INTO products ${db(product)}
      RETURNING *
    `;

    return created;
  }
};
