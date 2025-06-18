import { Router, Request, Response } from 'express';
import fileUpload, { UploadedFile, FileArray } from 'express-fileupload';
import { verifyApiKey } from '../../middleware/auth';
import { io } from '../../app';
import { supabase } from '../../config/supabaseClient';
import { RealtimeService } from '../../services/realtimeService';
import { InventoryService } from '../../services/inventoryService';
import { ImageService } from '../../services/imageService';
import { validate } from '../../middleware/validationMiddleware';
import { productSchema, productBusinessRules } from '../../schemas/productSchemas';

// Extend Request type properly
interface FileRequest extends Request {
  files?: FileArray | null;
}

const productsRouter = Router();

// Add fileUpload middleware before route handler
productsRouter.use(fileUpload());

productsRouter.post('/products', 
  verifyApiKey,
  validate({
    schema: productSchema,
    businessRules: [
      productBusinessRules.checkDuplicateName,
      productBusinessRules.validatePriceRange
    ],
    sanitize: true
  }),
  async (req: FileRequest, res: Response) => {
    try {
      // Check realtime health
      const realtime = RealtimeService.getInstance();
      if (!realtime.isHealthy()) {
        console.warn('⚠️ Realtime system unhealthy:', realtime.getStatus());
      }

      // Validate incoming product data
      const productData = req.body;
      
      // TODO: Add validation

      // Handle image upload if present
      let imageUrls: string[] = [];
      if (req.files && req.files.images) {
        const imageService = ImageService.getInstance();
        const files = Array.isArray(req.files.images) 
          ? req.files.images 
          : [req.files.images];

        imageUrls = await Promise.all(
          files.map(async (file: UploadedFile) => {
            const metadata = await ImageService.uploadImage(file.data);
            return imageService.getCdnUrl(metadata.publicId);
          })
        );
      }

      // Create product with image URLs
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{ ...productData, image_urls: imageUrls }])
        .select()
        .single();

      if (productError) throw productError;

      // Initialize inventory
      try {
        const inventoryService = InventoryService.getInstance();
        const inventory = await inventoryService.initializeInventory(product.id);

        // Emit events
        io.emit('product.created', {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          timestamp: new Date().toISOString(),
          type: 'created'
        });

        io.emit('inventory.initialized', {
          product_id: product.id,
          quantity: inventory.quantity,
          status: inventory.status
        });

        // Add status check in response
        res.status(201).json({
          success: true,
          message: 'Product created with inventory',
          data: { product, inventory },
          realtime: realtime.getStatus()
        });
      } catch (inventoryError) {
        console.error('Inventory initialization failed:', inventoryError);
        throw new Error('Failed to initialize inventory');
      }

    } catch (error) {
      console.error('Product creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process PMS product',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default productsRouter;
