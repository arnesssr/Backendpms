export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderDTO {
  customerName: string;
  customerEmail: string;
  total: number;
  items: OrderItem[];
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
