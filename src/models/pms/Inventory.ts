import { supabase } from '../../config/database';

export interface InventoryMovement {
  id: string;
  product_id: string;
  type: 'increase' | 'decrease';
  quantity: number;
  reason: string;
  timestamp: string;
  created_at?: string;
  updated_at?: string;
}

export const inventoryMovements = {
  async create(data: Omit<InventoryMovement, 'id' | 'created_at' | 'updated_at'>) {
    const { data: movement, error } = await supabase
      .from('inventory_movements')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return movement;
  },

  async getByProductId(productId: string) {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
