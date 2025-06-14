import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import { WebhookQueue } from './webhookQueueService';
import { ApiClient } from './apiClient';
import { redis } from '../config/redis';
import { supabase } from '../config/supabaseClient';

interface WebhookEvent {
  id: string;
  type: string;
  payload: any;
  attempts: number;
  lastAttempt?: Date;
  signature?: string;
}

export class WebhookService {
  verifySignature(body: any, arg1: string) {
    throw new Error('Method not implemented.');
  }
  private apiClient: ApiClient;
  private webhookQueue: WebhookQueue;
  private static instance: WebhookService;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [60, 300, 900]; // 1min, 5min, 15min

  constructor() {
    this.apiClient = ApiClient.getInstance();
    this.webhookQueue = WebhookQueue.getInstance();
  }

  static getInstance(): WebhookService {
    if (!this.instance) {
      this.instance = new WebhookService();
    }
    return this.instance;
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

  async queueEvent(type: string, payload: any): Promise<string> {
    const event: WebhookEvent = {
      id: crypto.randomUUID(),
      type,
      payload,
      attempts: 0,
      signature: this.signPayload(payload)
    };

    await redis.lpush('webhook:queue', JSON.stringify(event));
    await this.logEvent(event.id, 'queued', event);
    return event.id;
  }

  private signPayload(payload: any): string {
    const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET!);
    return hmac.update(JSON.stringify(payload)).digest('hex');
  }

  private async logEvent(eventId: string, status: string, data: any): Promise<void> {
    await supabase.from('webhook_events').insert({
      event_id: eventId,
      status,
      data,
      timestamp: new Date().toISOString()
    });
  }

  async processQueue(): Promise<void> {
    const event = await redis.rpop('webhook:queue');
    if (!event) return;

    const webhookEvent: WebhookEvent = JSON.parse(event);
    try {
      await this.deliverWebhook(webhookEvent);
      await this.logEvent(webhookEvent.id, 'delivered', webhookEvent);
    } catch (error) {
      await this.handleFailedDelivery(webhookEvent);
    }
  }

  private async handleFailedDelivery(event: WebhookEvent): Promise<void> {
    event.attempts++;
    event.lastAttempt = new Date();

    if (event.attempts < this.MAX_RETRIES) {
      const delay = this.RETRY_DELAYS[event.attempts - 1];
      await redis.zadd(
        'webhook:retry',
        Date.now() + delay * 1000,
        JSON.stringify(event)
      );
      await this.logEvent(event.id, 'retry_scheduled', event);
    } else {
      await this.logEvent(event.id, 'failed', event);
    }
  }

  private async deliverWebhook(event: WebhookEvent): Promise<void> {
    const targetUrl = await this.getWebhookEndpoint(event.type);
    
    const response: AxiosResponse = await this.apiClient.request({
      method: 'POST',
      url: targetUrl,
      data: event.payload,
      headers: {
        'x-webhook-signature': event.signature,
        'x-webhook-id': event.id,
        'x-webhook-timestamp': new Date().toISOString()
      },
      timeout: 5000 // 5 second timeout
    });

    if (response.status !== 200) {
      throw new Error(`Webhook delivery failed: ${response.status}`);
    }
  }

  private async getWebhookEndpoint(eventType: string): Promise<string> {
    const { data: endpoint } = await supabase
      .from('webhook_configurations')
      .select('endpoint_url')
      .eq('event_type', eventType)
      .single();

    if (!endpoint) {
      throw new Error(`No webhook endpoint configured for event type: ${eventType}`);
    }

    return endpoint.endpoint_url;
  }
}
