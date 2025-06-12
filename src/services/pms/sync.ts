import { supabase } from '../../config/database';
import { redis } from '../../config/redis';

export class PMSSyncService {
  async syncProduct(pmsProduct: any) {
    const lockKey = `sync:product:${pmsProduct.id}`;
    try {
      // Get lock for sync using proper Redis v4 syntax
      const locked = await redis.set(lockKey, 'locked', {
        NX: true,  // Only set if key doesn't exist
        EX: 30     // Expire in 30 seconds
      });
      
      if (!locked) throw new Error('Sync in progress');

      const { data: existingProduct } = await supabase
        .from('products')
        .select()
        .eq('pms_id', pmsProduct.id)
        .single();

      if (existingProduct) {
        // Update logic
      } else {
        // Create logic
      }
    } finally {
      await redis.del(lockKey);
    }
  }
}
