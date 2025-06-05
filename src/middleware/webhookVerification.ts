import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const verifyWebhookSignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  const computedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET || '')
    .update(payload)
    .digest('hex');

  if (signature !== computedSignature) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  next();
};
