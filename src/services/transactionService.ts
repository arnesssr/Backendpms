import { supabase } from '../config/supabaseClient';
import { redis } from '../config/redis';

export class TransactionService {
  private static instance: TransactionService;

  static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  async executeAtomicOperation<T>(
    operation: () => Promise<T>,
    lockKey: string
  ): Promise<T> {
    const lock = await redis.set(
      `lock:${lockKey}`,
      'locked',
      {
        NX: true,
        EX: 5
      }
    );

    if (!lock) {
      throw new Error('Operation in progress');
    }

    try {
      const result = await operation();
      return result;
    } finally {
      await redis.del(`lock:${lockKey}`);
    }
  }

  async withTransaction<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    // Start transaction
    const { error: startError } = await supabase.rpc('begin_transaction');
    if (startError) throw startError;

    try {
      const result = await operation();
      
      // Commit transaction
      const { error: commitError } = await supabase.rpc('commit_transaction');
      if (commitError) throw commitError;

      return result;
    } catch (error) {
      // Rollback on error
      await supabase.rpc('rollback_transaction');
      throw error;
    }
  }
}
