import express from 'express';
import { verifyApiKey } from '../middleware/auth';

const router = express.Router();

// Health check endpoint that PMS will call
router.get('/api/health', verifyApiKey, (req, res) => {
  res.json({ status: 'ok' });
});

// Add other PMS endpoints here that will RECEIVE requests from PMS
router.post('/api/products', verifyApiKey, (req, res) => {
  // Handle product creation from PMS
});

export default router;
