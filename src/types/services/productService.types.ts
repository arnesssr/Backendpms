import { Product } from '../models/product.types';

export interface ProductService {
  createProduct(product: Omit<Product, 'id'>): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product>;
  getProduct(id: string): Promise<Product | null>;
  listProducts(): Promise<Product[]>;
  deleteProduct(id: string): Promise<void>;
  publishProduct(id: string): Promise<Product>;
}
