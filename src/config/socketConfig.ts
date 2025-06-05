import { ServerOptions } from 'socket.io';

export const socketConfig: Partial<ServerOptions> = {
  path: process.env.SOCKET_PATH || '/socket.io',
  cors: {
    origin: [
      process.env.PMS_URL || 'http://localhost:5173',
      process.env.STOREFRONT_URL || 'http://localhost:3000'
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT || '5000'),
  pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL || '10000'),
  transports: ['websocket', 'polling']
};
