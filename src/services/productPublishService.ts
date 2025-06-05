import { supabase } from '../config/database';
import { WebhookQueue } from './webhookQueueService';
import { io } from '../app';

export interface PublishableProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  status: 'draft' | 'published' | 'archived';
  inventory: number;
  categoryId: string;
}

export class ProductPublishService {
  private static instance: ProductPublishService;
  webhookQueue: any;
  
  private constructor() {}
  
  public static getInstance(): ProductPublishService {
    if (!ProductPublishService.instance) {
      ProductPublishService.instance = new ProductPublishService();
    }
    return ProductPublishService.instance;
  }

  async publishProduct(productId: string): Promise<PublishableProduct> {
    const { data: product, error } = await supabase
      .from('products')
      .update({ 
        status: 'published',
        publishedAt: new Date().toISOString(),
        lastPublishedAt: new Date().toISOString() 
      })
      .eq('id', productId)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to publish product: ${error.message}`);

    // Notify storefront via webhook
    await this.webhookQueue.add('product.published', {
      event: 'product.published',
      data: product,
      timestamp: new Date().toISOString()
    });

    // Notify connected clients via WebSocket
    io.emit('product_published', { productId, status: 'published' });

    return product;
  }
}

export const productPublishService = ProductPublishService.getInstance();
