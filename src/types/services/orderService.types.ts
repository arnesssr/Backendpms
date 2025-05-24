import { Order, OrderItem } from '../models/order.types';

export interface OrderService {
  createOrder(order: Omit<Order, 'id'>): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  updateOrderStatus(id: string, status: Order['status']): Promise<Order>;
  listOrders(): Promise<Order[]>;
  addOrderItem(orderId: string, item: Omit<OrderItem, 'id' | 'orderId'>): Promise<OrderItem>;
}
