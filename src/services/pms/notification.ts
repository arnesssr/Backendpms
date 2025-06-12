import { redis } from '../../config/redis';

export class PMSNotificationService {
  async notifyPMSError(error: any) {
    const notification = {
      type: 'pms_error',
      message: error.message,
      timestamp: new Date().toISOString()
    };

    await redis.lPush('pms:notifications', JSON.stringify(notification));
    await redis.lTrim('pms:notifications', 0, 99); // Keep last 100
  }

  async getPMSNotifications() {
    const notifications = await redis.lRange('pms:notifications', 0, -1);
    return notifications.map(n => JSON.parse(n));
  }
}
