import { Router } from 'express';
import { verifyApiKey } from '../../middleware/auth';
import { io } from '../../app';
import { supabase } from '../../config/supabaseClient';
import { RealtimeService } from '../../services/realtimeService';
import { InventoryService } from '../../services/inventoryService';

const productsRouter = Router();

productsRouter.post('/products', verifyApiKey, async (req, res) => {
  try {
    // Check realtime health
    const realtime = RealtimeService.getInstance();
    if (!realtime.isHealthy()) {
      console.warn('⚠️ Realtime system unhealthy:', realtime.getStatus());
    }

    // Validate incoming product data
    const productData = req.body;
    
    // TODO: Add validation

    // Create product in database
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([productData])
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
});

export default productsRouter;
