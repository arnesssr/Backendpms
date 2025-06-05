import { Router } from 'express';
import { AuditService } from '../services/auditService';

const router = Router();
const auditService = AuditService.getInstance();

router.get('/:resourceType/:resourceId', async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const history = await auditService.getResourceHistory(resourceType, resourceId);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch audit logs'
    });
  }
});

export default router;
