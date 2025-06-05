import { Router } from 'express';
import { NotificationService } from '../services/notificationService';

const router = Router();
const notificationService = NotificationService.getInstance();

router.get('/alerts', (req, res) => {
  res.json({ alerts: [] }); // Placeholder for actual implementation
});

router.post('/subscribe', (req, res) => {
  const { type } = req.body;
  res.json({ success: true, type });
});

router.post('/send', async (req, res) => {
  try {
    const notification = req.body;
    await notificationService.send(notification);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification'
    });
  }
});

export default router;
