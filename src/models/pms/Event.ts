import { supabase } from '../../config/database';

export interface PMSEvent {
  id: string;
  type: 'product' | 'inventory' | 'order';
  action: string;
  data: Record<string, any>;
  processed: boolean;
  processed_at?: string;
  error?: string;
  created_at?: string;
  updated_at?: string;
}

export const pmsEvents = {
  async create(data: Omit<PMSEvent, 'id' | 'created_at' | 'updated_at'>) {
    const { data: event, error } = await supabase
      .from('pms_events')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return event;
  },

  async markAsProcessed(id: string, error?: string) {
    const { data: event, error: updateError } = await supabase
      .from('pms_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        error
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    return event;
  }
};
