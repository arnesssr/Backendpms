import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController';
import { validate } from '../utils/validation';
import { z } from 'zod';

const router = Router();

// Define schemas inline since they're specific to inventory
const movementSchema = z.object({
  type: z.enum(['in', 'out']),
  quantity: z.number().positive(),
  notes: z.string().optional(),
});

const stockSchema = z.object({
  stock: z.number().min(0),
});

// Routes with validation
router.post(
  '/:productId/movements',
  validate(movementSchema),
  // inventoryController.addMovement
);
router.patch(
  '/:productId/stock',
  validate(stockSchema),
  // inventoryController.adjustStock
);
router.get('/low-stock', inventoryController.getLowStockAlerts);
router.get('/:productId/movements', inventoryController.getMovements);

export default router;
