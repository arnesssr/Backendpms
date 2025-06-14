import { Router } from 'express';
import { verifyApiKey } from '../../middleware/auth';
import { WebhookService } from '../../services/webhookService';

const router = Router();

router.post('/api/pms/webhook/:type', verifyApiKey, async (req, res) => {
  try {
    const { type } = req.params;
    const webhookService = WebhookService.getInstance();
    
    // Validate signature using try-catch instead of truthiness check
    const signature = req.headers['x-webhook-signature'];
    try {
      if (!signature) {
        throw new Error('Missing signature');
      }
      await webhookService.verifySignature(req.body, signature as string);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Queue event
    const eventId = await webhookService.queueEvent(type, req.body);

    res.status(202).json({
      success: true,
      message: `Webhook ${type} event queued`,
      data: { eventId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook event',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
