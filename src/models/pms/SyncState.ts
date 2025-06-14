import { supabase } from '../../config/database';

export interface SyncState {
  id: string;
  entity_type: 'product' | 'inventory' | 'category';
  entity_id: string;
  last_synced_at: string;
  pms_version: string;
  local_version: string;
  status: 'synced' | 'pending' | 'conflict';
  created_at?: string;
  updated_at?: string;
}

export const syncStates = {
  async create(data: Omit<SyncState, 'id' | 'created_at' | 'updated_at'>) {
    const { data: state, error } = await supabase
      .from('sync_states')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return state;
  },

  async updateSyncState(entityId: string, data: Partial<SyncState>) {
    const { data: state, error } = await supabase
      .from('sync_states')
      .update(data)
      .eq('entity_id', entityId)
      .select()
      .single();

    if (error) throw error;
    return state;
  }
};
