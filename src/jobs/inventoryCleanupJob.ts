import { CronJob, CronCommand } from 'cron';
import { InventoryReservationService } from '../services/inventoryReservationService';

const cleanupCommand: CronCommand = async () => {
  try {
    const service = InventoryReservationService.getInstance();
    const cleaned = await service.cleanupExpiredReservations();
    console.log(`Cleaned up ${cleaned} expired reservations`);
  } catch (error) {
    console.error('Inventory cleanup failed:', error);
  }
};

const cleanupJob = new CronJob('*/15 * * * *', cleanupCommand, null, false, 'UTC');

export { cleanupJob };
