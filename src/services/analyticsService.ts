import { supabase } from '../config/database';

interface AnalyticsQuery {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
  metrics?: string[];
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async getSalesAnalytics(query: AnalyticsQuery) {
    const { data, error } = await supabase.rpc('get_sales_analytics', {
      start_date: query.startDate,
      end_date: query.endDate,
      group_by: query.groupBy || 'day'
    });

    if (error) throw new Error('Failed to fetch sales analytics');
    return data;
  }

  async getInventoryMetrics() {
    const { data, error } = await supabase
      .from('inventory_analytics')
      .select(`
        total_products,
        low_stock_items,
        out_of_stock_items,
        total_value,
        turnover_rate
      `)
      .single();

    if (error) throw new Error('Failed to fetch inventory metrics');
    return data;
  }

  async generateCustomReport(metrics: string[], filters: Record<string, any>) {
    const { data, error } = await supabase.rpc('generate_custom_report', {
      p_metrics: metrics,
      p_filters: filters
    });

    if (error) throw new Error('Failed to generate custom report');
    return data;
  }
}
