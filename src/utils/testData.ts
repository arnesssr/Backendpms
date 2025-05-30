import { db } from '../config/database';

export const insertTestProduct = async () => {
  try {
    console.log('📦 Inserting test product...');
    
    const [product] = await db`
      INSERT INTO products (
        name,
        description,
        price,
        category,
        status,
        stock
      ) VALUES (
        'Test Product',
        'Test Description',
        99.99,
        'books',
        'draft',
        10
      ) RETURNING *
    `;

    console.log('✅ Test product created:', product);
    return product;
  } catch (error) {
    console.error('❌ Test product creation failed:', error);
    throw error;
  }
};
