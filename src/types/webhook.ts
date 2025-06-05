export type WebhookEventType = 
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'inventory.updated'
  | 'order.created'
  | 'order.updated';

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: any;
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: WebhookEventType[];
}
