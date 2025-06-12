import { Router } from 'express';
import { verifyApiKey } from '../../middleware/auth';

const router = Router();

router.post('/api/pms/categories', verifyApiKey, async (req, res) => {
  try {
    const categoryData = req.body;
    
    // TODO: Add validation and processing
    
    res.status(201).json({
      success: true,
      message: 'Category received from PMS',
      data: categoryData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process PMS category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
