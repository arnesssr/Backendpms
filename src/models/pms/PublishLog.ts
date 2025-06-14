import { supabase } from '../../config/database';

export interface PublishLog {
  id: string;
  product_id: string;
  published_at: string;
  status: 'pending' | 'published' | 'failed';
  retry_count: number;
  error?: string;
  last_attempt: string;
  created_at?: string;
  updated_at?: string;
}

export const publishLogs = {
  async create(data: Omit<PublishLog, 'id' | 'created_at' | 'updated_at'>) {
    const { data: log, error } = await supabase
      .from('publish_logs')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return log;
  },

  async update(id: string, data: Partial<PublishLog>) {
    const { data: log, error } = await supabase
      .from('publish_logs')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return log;
  }
};
