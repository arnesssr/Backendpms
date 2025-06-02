import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController';

const router = Router();
const inventoryController = new InventoryController();

// Stock movements
router.post('/movements', inventoryController.recordMovement);
router.get('/movements/:productId', inventoryController.getStockHistory);

// Stock alerts and reconciliation
router.get('/alerts', inventoryController.getStockAlerts);
router.post('/reconcile/:productId', inventoryController.reconcileStock);

export default router;
