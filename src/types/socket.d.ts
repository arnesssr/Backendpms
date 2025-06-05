import { Server as SocketIOServer } from 'socket.io';
import { Socket as SocketIOSocket } from 'socket.io-client';

declare module 'socket.io' {
  interface ServerToClientEvents {
    inventory_update: (data: any) => void;
  }

  interface ClientToServerEvents {
    subscribe_inventory: (productId: string) => void;
  }

  interface InterServerEvents {
    ping: () => void;
  }

  interface SocketData {
    userId: string;
  }
}

export { SocketIOServer, SocketIOSocket };
