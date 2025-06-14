import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { db } from '../config/database';
import { ImageService } from '../services/imageService';
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

interface FileRequest extends Request {
  files?: {
    images?: UploadedFile | UploadedFile[];
  } | null;
}

export const productController = {
  async getAllProducts(req: Request, res: Response) {
    try {
      const products = await db.sql`
        SELECT * FROM products
        WHERE status = 'published'
      `;
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  },

  async createProduct(req: FileRequest, res: Response) {
    try {
      const files = req.files?.images as unknown as Express.Multer.File[];
      
      // Upload images first
      const imagePromises = files.map(file => ImageService.uploadImage(file));
      const uploadedImages = await Promise.all(imagePromises);

      // Create product with images
      const [product] = await db.sql`
        INSERT INTO products ${db.sql(
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

  async updateProduct(req: FileRequest, res: Response) {
    try {
      const { id } = req.params;
      const files = req.files?.images as unknown as Express.Multer.File[];
      
      let updatedImages: UploadedImage[] = [];
      if (files?.length) {
        const imagePromises = files.map(file => ImageService.uploadImage(file));
        updatedImages = await Promise.all(imagePromises);
      }

      const [updated] = await db.sql`
        UPDATE products 
        SET ${db.sql({
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
      const files = req.files as unknown as Express.Multer.File[];
      const imagePromises = files.map(file => ImageService.uploadImage(file));
      const uploadedImages = await Promise.all(imagePromises);
      
      res.json(uploadedImages);
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  }
};
