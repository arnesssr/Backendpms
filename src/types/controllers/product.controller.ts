import { Request, Response } from 'express';
import { Product } from '../models/product.types';

export interface ProductController {
  getAllProducts(req: Request, res: Response): Promise<void>;
  getProductById(req: Request, res: Response): Promise<void>;
  createProduct(req: Request, res: Response): Promise<void>;
  updateProduct(req: Request, res: Response): Promise<void>;
  deleteProduct(req: Request, res: Response): Promise<void>;
}

export interface CreateProductRequest extends Request {
  body: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface UpdateProductRequest extends Request {
  body: Partial<Product>;
}
