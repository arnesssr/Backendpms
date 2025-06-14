import { supabase } from '../config/supabaseClient';
import { redis } from '../config/redis';

export class TransactionManager {
  private static instance: TransactionManager;
  
  static getInstance(): TransactionManager {
    if (!this.instance) {
      this.instance = new TransactionManager();
    }
    return this.instance;
  }

  async executeTransaction<T>(
    operations: () => Promise<T>,
    lockKeys: string[] = []
  ): Promise<T> {
    const locks: string[] = [];
    
    try {
      // Acquire locks
      for (const key of lockKeys) {
        const acquired = await redis.set(`lock:${key}`, '1', 'NX', 'EX', 10);
        if (!acquired) {
          throw new Error(`Could not acquire lock for ${key}`);
        }
        locks.push(key);
      }

      // Begin transaction
      await supabase.rpc('begin_transaction');
      
      // Execute operations
      const result = await operations();
      
      // Commit transaction
      await supabase.rpc('commit_transaction');
      
      return result;
    } catch (error) {
      // Rollback on error
      await supabase.rpc('rollback_transaction');
      throw error;
    } finally {
      // Release locks
      for (const key of locks) {
        await redis.del(`lock:${key}`);
      }
    }
  }
}
