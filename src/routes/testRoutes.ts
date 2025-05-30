import { Router } from 'express';
import { db } from '../config/database';

const router = Router();

// Test endpoint
router.get('/test-product', async (req, res) => {
  console.log('🟢 Test endpoint hit');
  console.log('Headers:', req.headers);
  
  try {
    const testData = {
      message: 'Test endpoint working',
      timestamp: new Date().toISOString()
    };
    res.json(testData);
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({ error: 'Test endpoint failed' });
  }
});

router.post('/test-product', async (req, res) => {
  try {
    console.log('🔵 Creating test product with data:', req.body);
    
    const [product] = await db`
      INSERT INTO products (
        name,
        description,
        price,
        category,
        status
      ) VALUES (
        'Test Product',
        'Test Description',
        99.99,
        'books',
        'draft'
      )
      RETURNING *
    `;

    console.log('✅ Test product created:', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Test product creation failed:', error);
    res.status(500).json({ error: 'Failed to create test product' });
  }
});

export default router;
