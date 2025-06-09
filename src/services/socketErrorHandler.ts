import { Socket } from 'socket.io';
import { RetryUtils } from '../utils/retry';

export class SocketErrorHandler {
  static handleConnectionError(socket: Socket, error: Error): void {
    console.error(`Socket ${socket.id} error:`, error);
    socket.emit('connection_error', {
      message: 'Connection error occurred',
      reconnect: true
    });
  }

  static async handleSubscriptionError(
    socket: Socket,
    channel: string,
    error: Error
  ): Promise<void> {
    console.error(`Subscription error for ${channel}:`, error);
    
    try {
      await RetryUtils.withRetry(
        async () => socket.join(channel),
        { maxAttempts: 3, delay: 1000 }
      );
      
      socket.emit('subscription_recovered', { channel });
    } catch (retryError) {
      socket.emit('subscription_failed', {
        channel,
        error: 'Failed to recover subscription'
      });
    }
  }
}
