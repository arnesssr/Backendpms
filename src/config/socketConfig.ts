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
  transports: ['websocket', 'polling']
};
