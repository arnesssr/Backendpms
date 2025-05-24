import { Sql } from 'postgres';

export interface BaseController {
  db: Sql;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  status: 'draft' | 'published' | 'archived';
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: 'in' | 'out';
  quantity: number;
  notes?: string;
}
