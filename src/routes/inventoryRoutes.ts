import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController';
import { InventoryReservationService } from '../services/inventoryReservationService';

const router = Router();
const inventoryController = new InventoryController();
const reservationService = InventoryReservationService.getInstance();

// Stock movements
router.post('/movements', inventoryController.recordMovement);
router.get('/movements/:productId', inventoryController.getStockHistory);

// Stock alerts and reconciliation
router.get('/alerts', inventoryController.getStockAlerts);
router.post('/reconcile/:productId', inventoryController.reconcileStock);

// Reservations
router.post('/reserve', async (req, res) => {
  try {
    const { productId, quantity, orderId } = req.body;
    await reservationService.reserveStock({
      productId,
      quantity,
      orderId
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Reservation failed'
    });
  }
});

export default router;
