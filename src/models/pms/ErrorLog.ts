import { supabase } from '../../config/database';

export interface ErrorLog {
  id: string;
  operation: string;
  entity_type: string;
  entity_id?: string;
  error: string;
  stack?: string;
  metadata: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const errorLogs = {
  async create(data: Omit<ErrorLog, 'id' | 'created_at' | 'updated_at'>) {
    const { data: log, error } = await supabase
      .from('error_logs')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return log;
  },

  async getByEntityId(entityId: string) {
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
