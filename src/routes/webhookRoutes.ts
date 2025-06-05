import { Router } from 'express';
import { WebhookService } from '../services/webhookService';

const router = Router();
const webhookService = new WebhookService();

// Webhook verification endpoint
router.post('/verify', async (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  // Verify webhook signature logic here
  res.json({ status: 'verified' });
});

// Product update webhook
router.post('/product-update', async (req, res) => {
  try {
    await webhookService.notifyStorefront('product.updated', req.body);
    res.json({ status: 'webhook sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send webhook' });
  }
});

export default router;
