import { supabase } from '../config/database';
import { WebhookQueue } from './webhookQueueService';
import { io } from '../app';

type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
type NotificationChannel = 'email' | 'sms' | 'websocket' | 'push';

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  channels: NotificationChannel[];
}

interface NotificationPayload {
  userId: string;
  template: string;
  data: Record<string, any>;
  priority: NotificationPriority;
  channels?: NotificationChannel[];
}

export class NotificationService {
  private static instance: NotificationService;
  private webhookQueue: WebhookQueue;

  private constructor() {
    this.webhookQueue = WebhookQueue.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async send(notification: NotificationPayload): Promise<void> {
    const template = await this.getTemplate(notification.template);
    if (!template) throw new Error('Template not found');

    const channels = notification.channels || template.channels;
    const promises = channels.map(channel => 
      this.dispatchToChannel(channel, template, notification)
    );

    await Promise.all(promises);

    // Track delivery
    await this.trackDelivery(notification, channels);
  }

  private async dispatchToChannel(
    channel: NotificationChannel,
    template: NotificationTemplate,
    notification: NotificationPayload
  ): Promise<void> {
    const content = this.interpolateTemplate(template.content, notification.data);

    switch (channel) {
      case 'websocket':
        io.to(notification.userId).emit('notification', {
          title: template.subject,
          message: content,
          priority: notification.priority
        });
        break;

      case 'email':
        await this.webhookQueue.add('notification.email', {
          event: 'send_email',
          data: {
            to: notification.userId,
            subject: template.subject,
            content
          },
          timestamp: new Date().toISOString()
        });
        break;

      case 'push':
        await this.webhookQueue.add('notification.push', {
          event: 'send_push',
          data: {
            userId: notification.userId,
            title: template.subject,
            body: content
          },
          timestamp: new Date().toISOString()
        });
        break;
    }
  }

  private async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    const { data, error } = await supabase
      .from('notification_templates')
      .select()
      .eq('id', templateId)
      .single();

    if (error) throw new Error('Failed to fetch template');
    return data;
  }

  private interpolateTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      return data[key.trim()] || '';
    });
  }

  private async trackDelivery(
    notification: NotificationPayload,
    channels: NotificationChannel[]
  ): Promise<void> {
    await supabase.from('notification_deliveries').insert({
      user_id: notification.userId,
      template_id: notification.template,
      channels,
      priority: notification.priority,
      sent_at: new Date().toISOString()
    });
  }
}
