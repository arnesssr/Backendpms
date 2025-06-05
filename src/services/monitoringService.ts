import { supabase } from '../config/database';
import { io } from '../app';

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  active_connections: number;
  request_count: number;
  error_count: number;
  response_time: number;
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
}
