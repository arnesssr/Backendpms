export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id?: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt?: Date;
}

export interface Order {
  id?: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: OrderItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateOrderDTO {
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}
