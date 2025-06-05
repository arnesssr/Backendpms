import { supabase } from '../config/database';
import { io } from '../app';
import { redis } from '../config/redis';

export class HealthcheckService {
  private static instance: HealthcheckService;
  
  private constructor() {} // Empty constructor - singleton pattern
  
  public static getInstance(): HealthcheckService {
    if (!HealthcheckService.instance) {
      HealthcheckService.instance = new HealthcheckService();
    }
    return HealthcheckService.instance;
  }

  async checkSystem() {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      memory: this.checkMemory(),
      websocket: this.checkWebSocket(),
      uptime: process.uptime()
    };

    if (!checks.database || !checks.memory.healthy) {
      io.emit('system_alert', {
        type: 'health_warning',
        message: 'System health degraded',
        checks
      });
    }

    return checks;
  }

  private async checkDatabase() {
    try {
      const start = Date.now();
      await supabase.from('products').select('count').limit(1);
      return { healthy: true, latency: Date.now() - start };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { healthy: false, error: errorMessage };
    }
  }

  private async checkRedis() {
    try {
      const start = Date.now();
      const pong = await redis.ping();
      const latency = Date.now() - start;
      return {
        healthy: pong === 'PONG',
        latency,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Redis check failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  private checkMemory() {
    const used = process.memoryUsage();
    const maxHeap = 512 * 1024 * 1024; // 512MB
    return {
      healthy: used.heapUsed < maxHeap,
      usage: {
        heapUsed: Math.round(used.heapUsed / 1024 / 1024),
        heapTotal: Math.round(used.heapTotal / 1024 / 1024),
        rss: Math.round(used.rss / 1024 / 1024)
      }
    };
  }

  private checkWebSocket() {
    return {
      healthy: io.engine.clientsCount !== undefined,
      connections: io.engine.clientsCount
    };
  }
}
