import { Router } from 'express';

const router = Router();

router.get('/alerts', (req, res) => {
  res.json({ alerts: [] }); // Placeholder for actual implementation
});

router.post('/subscribe', (req, res) => {
  const { type } = req.body;
  res.json({ success: true, type });
});

export default router;
