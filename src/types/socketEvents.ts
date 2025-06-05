/**
 * Socket.IO Event Types
 * Version: 1.1.0
 * 
 * Changes from 1.0.0:
 * - Removed server configuration
 * - Added proper type interfaces
 * - Added InterServerEvents
 * - Added SocketData interface
 */

export interface ServerToClientEvents {
  product_published: (data: { productId: string; status: string }) => void;
  inventory_update: (data: { productId: string; stock: number }) => void;
  order_status: (data: { orderId: string; status: string }) => void;
}

export interface ClientToServerEvents {
  subscribe_inventory: (productId: string) => void;
  subscribe_order: (orderId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  clientId: string;
}