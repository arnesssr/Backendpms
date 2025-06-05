import axios from 'axios';
import crypto from 'crypto';
import { WebhookQueue } from './webhookQueueService';

export class WebhookService {
  private webhookQueue: WebhookQueue;

  constructor() {
    this.webhookQueue = WebhookQueue.getInstance();
  }

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

  async notifyStorefront(event: string, data: any): Promise<void> {
    try {
      await this.webhookQueue.add('storefront-notification', {
        event,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to notify storefront: ${errorMessage}`);
    }
  }
}
