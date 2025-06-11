import express from 'express';
import { verifyApiKey } from '../middleware/auth';

const router = express.Router();

router.get('/api/auth/verify', verifyApiKey, (req, res) => {
  res.json({ 
    authenticated: true,
    timestamp: new Date().toISOString()
  });
});

export default router;
