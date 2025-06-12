import { Router } from 'express';
import { verifyApiKey } from '../../middleware/auth';

const router = Router();

router.post('/api/pms/webhook/:type', verifyApiKey, async (req, res) => {
  try {
    const { type } = req.params;
    const eventData = req.body;

    // TODO: Add event validation and processing

    res.status(200).json({
      success: true,
      message: `Webhook ${type} event received`,
      data: eventData
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
