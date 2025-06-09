import axios from 'axios';
import crypto from 'crypto';
import { WebhookQueue } from './webhookQueueService';
import { ApiClient } from './apiClient';

export class WebhookService {
  private apiClient: ApiClient;
  private webhookQueue: WebhookQueue;

  constructor() {
    this.apiClient = ApiClient.getInstance();
    this.webhookQueue = WebhookQueue.getInstance();
  }

  async notify(endpoint: string, event: string, data: any) {
    try {
      await this.apiClient.request({
        method: 'POST',
        url: endpoint,
        data: {
          event,
          data,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      // Add to retry queue with correct payload type
      await this.webhookQueue.add('webhook-retry', {
        event,
        data,
        timestamp: new Date().toISOString(),
        endpoint,
        attempts: 0
      });
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
