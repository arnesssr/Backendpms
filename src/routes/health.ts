import express from 'express';
import { verifyApiKey } from '../middleware/auth';
import { getRedisStatus, getDatabaseStatus } from '../services/healthCheck';

const router = express.Router();

router.get('/health', verifyApiKey, async (req, res) => {
  const dbStatus = await getDatabaseStatus();
  const redisStatus = await getRedisStatus();

  console.log('Health Check: Authentication successful');
  console.log('Health Check: Database status -', dbStatus.healthy ? 'Connected' : 'Failed');
  console.log('Health Check: Redis status -', redisStatus.healthy ? 'Connected' : 'Failed');

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      database: dbStatus,
      redis: redisStatus,
      memory: {
        healthy: true,
        usage: process.memoryUsage()
      },
      uptime: process.uptime()
    }
  });
});

export default router;
