import { supabase } from '../config/database';
import { WebhookQueue } from './webhookQueueService';
import { InventoryReservationService } from './inventoryReservationService';
import { Order, OrderStatus, OrderTransition } from '../types/order';
import { io } from '../app';

export class OrderProcessingService {
  private static instance: OrderProcessingService;
  private webhookQueue: WebhookQueue;
  private inventoryService: InventoryReservationService;

  private readonly allowedTransitions: OrderTransition[] = [
    { from: 'pending', to: 'confirmed', action: 'confirm' },
    { from: 'confirmed', to: 'processing', action: 'process' },
    { from: 'processing', to: 'shipped', action: 'ship' },
    { from: 'shipped', to: 'delivered', action: 'deliver' },
    { from: 'pending', to: 'cancelled', action: 'cancel' },
    { from: 'confirmed', to: 'cancelled', action: 'cancel' },
    { from: 'delivered', to: 'refunded', action: 'refund' }
  ];

  private constructor() {
    this.webhookQueue = WebhookQueue.getInstance();
    this.inventoryService = InventoryReservationService.getInstance();
  }

  public static getInstance(): OrderProcessingService {
    if (!OrderProcessingService.instance) {
      OrderProcessingService.instance = new OrderProcessingService();
    }
    return OrderProcessingService.instance;
  }

  async createOrder(orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    // Reserve inventory first
    for (const item of orderData.items) {
      await this.inventoryService.reserveStock({
        productId: item.productId,
        quantity: item.quantity,
        orderId: crypto.randomUUID()
      });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create order: ${error.message}`);

    // Notify via WebSocket
    io.emit('order_created', { orderId: order.id, status: 'pending' });

    // Queue webhook notification
    await this.webhookQueue.add('order.created', {
      event: 'order.created',
      data: order,
      timestamp: new Date().toISOString()
    });

    return order;
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select()
      .eq('id', orderId)
      .single();

    if (fetchError) throw new Error('Order not found');

    const isValidTransition = this.allowedTransitions.some(
      t => t.from === currentOrder.status && t.to === newStatus
    );

    if (!isValidTransition) {
      throw new Error(`Invalid status transition from ${currentOrder.status} to ${newStatus}`);
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update order: ${error.message}`);

    // Handle post-transition actions
    await this.handlePostTransitionActions(order);

    return order;
  }

  private async handlePostTransitionActions(order: Order): Promise<void> {
    switch (order.status) {
      case 'cancelled':
        // Release inventory
        for (const item of order.items) {
          await this.inventoryService.releaseReservation(order.id, item.productId);
        }
        break;
      case 'delivered':
        // Commit inventory changes
        // Send confirmation emails
        break;
      // Add more status-specific actions
    }

    // Notify via WebSocket
    io.emit('order_updated', { orderId: order.id, status: order.status });

    // Queue webhook notification
    await this.webhookQueue.add('order.updated', {
      event: 'order.updated',
      data: order,
      timestamp: new Date().toISOString()
    });
  }
}
