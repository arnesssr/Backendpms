export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  customerId: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type OrderTransition = {
  from: OrderStatus;
  to: OrderStatus;
  action: string;
};
