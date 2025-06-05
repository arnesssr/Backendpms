import { supabase } from '../config/database';
import { WebhookQueue } from './webhookQueueService';
import { io } from '../app';

interface ReservationRequest {
  productId: string;
  quantity: number;
  orderId: string;
  expiresIn?: number; // seconds
}

export class InventoryReservationService {
  private static instance: InventoryReservationService;
  private webhookQueue: WebhookQueue;

  private constructor() {
    this.webhookQueue = WebhookQueue.getInstance();
  }

  public static getInstance(): InventoryReservationService {
    if (!InventoryReservationService.instance) {
      InventoryReservationService.instance = new InventoryReservationService();
    }
    return InventoryReservationService.instance;
  }

  async reserveStock({ productId, quantity, orderId, expiresIn = 900 }: ReservationRequest) {
    const { data: product, error: lockError } = await supabase.rpc('lock_inventory', {
      p_product_id: productId
    });

    if (lockError) throw new Error('Failed to lock inventory');

    try {
      const { data: inventory, error } = await supabase
        .from('inventory')
        .select('available_quantity, reserved_quantity')
        .eq('product_id', productId)
        .single();

      if (error || !inventory) throw new Error('Inventory not found');

      if (inventory.available_quantity < quantity) {
        throw new Error('Insufficient stock');
      }

      const { error: reserveError } = await supabase
        .from('inventory_reservations')
        .insert({
          product_id: productId,
          order_id: orderId,
          quantity,
          expires_at: new Date(Date.now() + (expiresIn * 1000)).toISOString()
        });

      if (reserveError) throw new Error('Failed to create reservation');

      // Update inventory counts
      const { error: updateError } = await supabase
        .from('inventory')
        .update({
          available_quantity: inventory.available_quantity - quantity,
          reserved_quantity: inventory.reserved_quantity + quantity
        })
        .eq('product_id', productId);

      if (updateError) throw new Error('Failed to update inventory');

      // Notify via WebSocket
      io.to(`inventory:${productId}`).emit('inventory_updated', {
        productId,
        availableQuantity: inventory.available_quantity - quantity,
        reservedQuantity: inventory.reserved_quantity + quantity
      });

      return true;
    } finally {
      // Release lock
      await supabase.rpc('unlock_inventory', {
        p_product_id: productId
      });
    }
  }

  async releaseReservation(orderId: string, productId: string) {
    const { data: reservation, error: fetchError } = await supabase
      .from('inventory_reservations')
      .select('quantity')
      .match({ order_id: orderId, product_id: productId })
      .single();

    if (fetchError || !reservation) throw new Error('Reservation not found');

    const { error: lockError } = await supabase.rpc('lock_inventory', {
      p_product_id: productId
    });

    if (lockError) throw new Error('Failed to lock inventory');

    try {
      // Release the reservation
      const { error: releaseError } = await supabase
        .from('inventory_reservations')
        .delete()
        .match({ order_id: orderId, product_id: productId });

      if (releaseError) throw new Error('Failed to release reservation');

      // Update inventory counts
      const { error: updateError } = await supabase
        .from('inventory')
        .update({
          available_quantity: `available_quantity + ${reservation.quantity}`,
          reserved_quantity: `reserved_quantity - ${reservation.quantity}`
        })
        .eq('product_id', productId);

      if (updateError) throw new Error('Failed to update inventory');

      // Notify via WebSocket
      io.to(`inventory:${productId}`).emit('reservation_released', {
        productId,
        orderId,
        quantity: reservation.quantity
      });

      return true;
    } finally {
      await supabase.rpc('unlock_inventory', {
        p_product_id: productId
      });
    }
  }

  async cleanupExpiredReservations() {
    const { data: expired, error: fetchError } = await supabase
      .from('inventory_reservations')
      .select('*')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) throw new Error('Failed to fetch expired reservations');

    for (const reservation of expired) {
      await this.releaseReservation(reservation.order_id, reservation.product_id);
    }

    return expired?.length || 0;
  }
}
