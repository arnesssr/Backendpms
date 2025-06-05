import { Queue } from 'bull';

interface WebhookJob {
  endpoint: string;
  event: string;
  data: any;
  attempts: number;
}

export class WebhookQueueService {
  private queue: Queue<WebhookJob>;

  constructor() {
    this.queue = new Queue('webhooks');
    this.setupProcessors();
  }

  async addToQueue(endpoint: string, event: string, data: any) {
    await this.queue.add({
      endpoint,
      event,
      data,
      attempts: 0
    });
  }

  private setupProcessors() {
    this.queue.process(async (job) => {
      // Process webhook with retries
    });
  }
}
