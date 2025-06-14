import express from 'express';
import { verifyApiKey } from '../middleware/auth';

const router = express.Router();

router.get('/api/products', verifyApiKey, async (req, res) => {
  try {
    // TODO: Implement database fetch
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/api/products', verifyApiKey, async (req, res) => {
  try {
    const product = {
      id: crypto.randomUUID(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // TODO: Implement database save
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

export default router;
