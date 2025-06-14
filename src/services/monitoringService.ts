import { supabase } from '../config/database';
import { io } from '../app';
import { redis } from '../config/redis';
import { Request, Response } from 'express';

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  active_connections: number;
  request_count: number;
  error_count: number;
  response_time: number;
}

interface PerformanceMetrics {
  responseTime: number;
  endpoint: string;
  method: string;
  timestamp: number;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private metrics: SystemMetrics = {
    cpu_usage: 0,
    memory_usage: 0,
    active_connections: 0,
    request_count: 0,
    error_count: 0,
    response_time: 0
  };
  private readonly METRICS_KEY = 'metrics:api';
  private readonly RATE_LIMIT_WINDOW = 60; // 1 minute
  private readonly ALERT_THRESHOLDS = {
    responseTime: 1000, // 1 second
    errorRate: 0.05, // 5%
    requestRate: 1000 // requests per minute
  };

  private constructor() {
    this.startMetricsCollection();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private startMetricsCollection() {
    setInterval(() => {
      this.collectMetrics();
    }, 60000); // Every minute
  }

  private async collectMetrics() {
    const metrics = {
      ...this.metrics,
      cpu_usage: process.cpuUsage().user / 1000000,
      memory_usage: process.memoryUsage().heapUsed / 1024 / 1024,
      timestamp: new Date().toISOString()
    };

    await this.saveMetrics(metrics);
    this.emitMetrics(metrics);
  }

  private async saveMetrics(metrics: SystemMetrics) {
    await supabase
      .from('system_metrics')
      .insert([metrics]);
  }

  private emitMetrics(metrics: SystemMetrics) {
    io.emit('system_metrics', metrics);
  }

  public recordError(error: Error) {
    this.metrics.error_count++;
    // Log error for analysis
  }

  public recordRequest(responseTime: number) {
    this.metrics.request_count++;
    this.metrics.response_time = 
      (this.metrics.response_time + responseTime) / 2;
  }

  async recordMetrics(req: Request, res: Response, duration: number): Promise<void> {
    const metrics: PerformanceMetrics = {
      responseTime: duration,
      endpoint: req.path,
      method: req.method,
      timestamp: Date.now()
    };

    await Promise.all([
      this.updateResponseTimeMetrics(metrics),
      this.updateRequestRateMetrics(req.path),
      this.checkThresholds(metrics)
    ]);
  }

  private async updateResponseTimeMetrics(metrics: PerformanceMetrics): Promise<void> {
    await redis.zAdd(
      `${this.METRICS_KEY}:response_times`,
      { score: metrics.timestamp, value: JSON.stringify(metrics) }
    );
  }

  private async updateRequestRateMetrics(endpoint: string): Promise<void> {
    const now = Date.now();
    const key = `${this.METRICS_KEY}:rates:${endpoint}`;
    
    await redis
      .multi()
      .zAdd(key, { score: now, value: now.toString() })
      .zRemRangeByScore(key, '-inf', now - (this.RATE_LIMIT_WINDOW * 1000))
      .exec();
  }

  private async checkThresholds(metrics: PerformanceMetrics): Promise<void> {
    if (metrics.responseTime > this.ALERT_THRESHOLDS.responseTime) {
      await this.triggerAlert('responseTime', metrics);
    }

    const requestRate = await this.getCurrentRequestRate(metrics.endpoint);
    if (requestRate > this.ALERT_THRESHOLDS.requestRate) {
      await this.triggerAlert('requestRate', { endpoint: metrics.endpoint, rate: requestRate });
    }
  }

  private async getCurrentRequestRate(endpoint: string): Promise<number> {
    return redis.zCount(
      `${this.METRICS_KEY}:rates:${endpoint}`,
      Date.now() - (this.RATE_LIMIT_WINDOW * 1000),
      '+inf'
    );
  }

  private async triggerAlert(type: string, data: any): Promise<void> {
    await redis.publish('monitoring:alerts', JSON.stringify({
      type,
      data,
      timestamp: new Date().toISOString()
    }));
  }
}
