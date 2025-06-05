import { Router } from 'express';
import { AuditService } from '../services/auditService';

const router = Router();
const auditService = new AuditService();

router.get('/', async (req, res) => {
  const logs = await auditService.getAuditHistory('all', 'all');
  res.json(logs);
});

router.get('/:entityType/:entityId', async (req, res) => {
  const { entityType, entityId } = req.params;
  const logs = await auditService.getAuditHistory(entityType, entityId);
  res.json(logs);
});

export default router;
