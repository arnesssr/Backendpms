import { Router } from 'express';
import { db } from '../config/database';

const router = Router();

// Connection test endpoint
router.get('/connection', async (req, res) => {
  try {
    res.json({
      message: 'Connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Connection test failed' });
  }
});

// Database test endpoint
router.get('/database', async (req, res) => {
  try {
    await db`SELECT 1+1 AS result`;
    res.json({
      connected: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Auth test endpoint
router.get('/auth', (req, res) => {
  // API Key middleware will handle authentication
  res.json({
    authenticated: true,
    timestamp: new Date().toISOString()
  });
});

export default router;
