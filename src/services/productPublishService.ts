import { supabase } from './supabaseService';
import type { Product } from '../types/models/product.types';
import { db } from '../config/database'

export const productPublishService = {
  async publishProduct(productId: string) {
    // 1. Get product from PMS database
    const [product] = await db`
      SELECT * FROM products WHERE id = ${productId}
    `;

    if (!product) {
      throw new Error('Product not found');
    }

    // 2. Transform for public storefront
    const publicProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.imageUrls,
      category: product.category,
      status: 'published',
      publishedAt: new Date().toISOString()
    };

    // 3. Insert/Update in Supabase public table
    const { data, error } = await supabase
      .from('products_public')
      .upsert(publicProduct);

    if (error) {
      throw new Error(`Failed to publish to storefront: ${error.message}`);
    }

    // 4. Update status in PMS database
    await db`
      UPDATE products 
      SET status = 'published', 
          published_at = ${new Date()} 
      WHERE id = ${productId}
    `;

    return data;
  }
};
