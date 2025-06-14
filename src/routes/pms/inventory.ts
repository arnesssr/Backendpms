import { Router } from 'express';
import { verifyApiKey } from '../../middleware/auth';
import { InventoryService } from '../../services/inventoryService';
import { ValidationError } from '../../utils/errors';

const router = Router();

router.post('/inventory/adjust', verifyApiKey, async (req, res) => {
  try {
    const { productId, adjustment, reason } = req.body;
    
    const inventoryService = InventoryService.getInstance();
    
    try {
      await inventoryService.validateStockLevel(productId, Math.abs(adjustment));
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError instanceof ValidationError 
          ? validationError.message 
          : 'Invalid inventory adjustment'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inventory adjustment received',
      data: { productId, adjustment, reason }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process inventory adjustment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
