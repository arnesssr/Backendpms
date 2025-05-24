export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  status: 'draft' | 'published' | 'archived';
}
