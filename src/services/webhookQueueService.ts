import Bull from 'bull';

export class WebhookQueue {
  private static instance: WebhookQueue;
  private queue: Bull.Queue;

  private constructor() {
    this.queue = new Bull('webhooks', {
      redis: process.env.REDIS_URL,
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3
      }
    });
  }

  static getInstance(): WebhookQueue {
    if (!WebhookQueue.instance) {
      WebhookQueue.instance = new WebhookQueue();
    }
    return WebhookQueue.instance;
  }

  async add(name: string, data: any, opts?: Bull.JobOptions): Promise<Bull.Job> {
    return this.queue.add(name, data, opts);
  }

  async cleanup(): Promise<void> {
    if (this.queue) {
      await Promise.all([
        this.queue.pause(true),
        this.queue.clean(0, 'completed'),
        this.queue.clean(0, 'failed')
      ]);
      await this.queue.close();
    }
  }

  // Add other needed Bull methods
  getQueue(): Bull.Queue {
    return this.queue;
  }
}

export default WebhookQueue;
