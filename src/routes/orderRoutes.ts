import { Router } from 'express';
import { OrderProcessingService } from '../services/orderProcessingService';
import { validateOrder } from '../middleware/orderValidation';

const router = Router();
const orderService = OrderProcessingService.getInstance();

router.post('/', validateOrder, async (req, res) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order'
    });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(id, status);
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order'
    });
  }
});

export default router;
