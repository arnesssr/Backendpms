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

// Database reset endpoint for tests
router.post('/reset-db', async (req, res) => {
  try {
    await db`TRUNCATE TABLE products CASCADE`;
    res.json({ message: 'Database reset successful' });
  } catch (error) {
    console.error('Reset DB error:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// Add debug endpoint
router.get('/debug', async (req, res) => {
  try {
    const [result] = await db`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'published') as published
      FROM products
    `;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Debug query failed' });
  }
});

export default router;
