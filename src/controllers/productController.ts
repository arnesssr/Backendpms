import { Request, Response } from 'express';
import { db } from '../config/database';
import { imageService } from '../services/imageService';
import { productPublishService } from '../services/productPublishService';
import { supabase } from '../services/supabaseService';
import type { Product } from '../types/models/product.types';

// Add type definition for uploaded image
interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export const productController = {
  async getAllProducts(req: Request, res: Response) {
    try {
      const products = await db`
        SELECT * FROM products
        WHERE status = 'published'
      `;
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  },

  async createProduct(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      
      // Upload images first
      const imagePromises = files.map(file => imageService.uploadImage(file));
      const uploadedImages = await Promise.all(imagePromises);

      // Create product with images
      const [product] = await db`
        INSERT INTO products ${db(
          {
            ...req.body,
            images: uploadedImages,
            status: 'draft',
            created_at: new Date(),
            updated_at: new Date()
          }
        )} RETURNING *
      `;

      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  },

  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];
      
      let updatedImages: UploadedImage[] = [];
      if (files?.length) {
        const imagePromises = files.map(file => imageService.uploadImage(file));
        updatedImages = await Promise.all(imagePromises);
      }

      const [updated] = await db`
        UPDATE products 
        SET ${db({
          ...req.body,
          ...(updatedImages.length && { images: updatedImages }),
          updated_at: new Date()
        })}
        WHERE id = ${id}
        RETURNING *
      `;

      res.json(updated);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  },

  async publishProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productPublishService.publishProduct(id);
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish product'
      });
    }
  },

  async uploadImages(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      const imagePromises = files.map(file => imageService.uploadImage(file));
      const uploadedImages = await Promise.all(imagePromises);
      
      res.json(uploadedImages);
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  }
};
