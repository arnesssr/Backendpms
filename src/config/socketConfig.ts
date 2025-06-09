import { ServerOptions } from 'socket.io';
import { SocketErrorHandler } from '../services/socketErrorHandler';

export const socketConfig: Partial<ServerOptions> = {
  cors: {
    origin: [
      process.env.PMS_URL || 'http://localhost:5173',
      process.env.STOREFRONT_URL || 'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 30000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  }
};

export const socketMiddleware = {
  errorHandler: SocketErrorHandler.handleConnectionError,
  subscriptionErrorHandler: SocketErrorHandler.handleSubscriptionError
};
