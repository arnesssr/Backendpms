import { Router } from 'express';
import { verifyApiKey } from '../../middleware/auth';

const router = Router();

router.post('/api/pms/products', verifyApiKey, async (req, res) => {
  try {
    // Validate incoming product data
    const productData = req.body;
    
    // TODO: Add validation

    res.status(201).json({
      success: true,
      message: 'Product received from PMS',
      data: productData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process PMS product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
