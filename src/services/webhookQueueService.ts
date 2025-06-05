import Bull = require('bull');

interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
}

export class WebhookQueue {
  private static instance: WebhookQueue;
  private queue: Bull.Queue<WebhookPayload>;

  private constructor() {
    this.queue = new Bull('webhooks', {
      redis: process.env.REDIS_URL
    });
  }

  public static getInstance(): WebhookQueue {
    if (!WebhookQueue.instance) {
      WebhookQueue.instance = new WebhookQueue();
    }
    return WebhookQueue.instance;
  }

  public async add(name: string, data: WebhookPayload): Promise<Bull.Job<WebhookPayload>> {
    return this.queue.add(name, data);
  }

  private async process(): Promise<void> {
    this.queue.process(async (job: Bull.Job<WebhookPayload>) => {
      try {
        // Process webhook
        return job.data;
      } catch (error) {
        throw error;
      }
    });
  }
}
