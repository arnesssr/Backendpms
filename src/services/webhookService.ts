import axios from 'axios';
import crypto from 'crypto';

export class WebhookService {
  async notify(endpoint: string, event: string, data: any) {
    const signature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET || '')
      .update(JSON.stringify(data))
      .digest('hex');

    try {
      await axios.post(endpoint, data, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Event-Type': event
        }
      });
    } catch (error) {
      console.error('Webhook delivery failed:', error);
      // Add to retry queue
    }
  }
}
