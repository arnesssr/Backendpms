export interface ProductEvent {
  productId: string;
  status: 'draft' | 'published' | 'archived';
  timestamp: string;
}

export interface WebSocketEvents {
  product_published: (data: ProductEvent) => void;
  product_updated: (data: ProductEvent) => void;
  inventory_update: (data: { productId: string; stock: number }) => void;
}
