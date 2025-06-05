import { Router } from 'express';
import { AnalyticsService } from '../services/analyticsService';

const router = Router();
const analyticsService = AnalyticsService.getInstance();

router.get('/sales', async (req, res) => {
  try {
    const query = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      groupBy: req.query.groupBy as 'day' | 'week' | 'month'
    };
    const data = await analyticsService.getSalesAnalytics(query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch analytics'
    });
  }
});

router.get('/inventory/metrics', async (req, res) => {
  try {
    const data = await analyticsService.getInventoryMetrics();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch metrics'
    });
  }
});

export default router;
