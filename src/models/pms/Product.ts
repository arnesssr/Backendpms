import { supabase } from '../../config/database';

export interface PMSProduct {
  id: string;
  pms_id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  status: 'draft' | 'published' | 'archived';
  stock: number;
  image_urls: string[];
  created_at: Date;
  updated_at: Date;
  published_at?: Date | null;
}

export const pmsProductTable = 'pms_products';

export const pmsProducts = {
  async create(data: Omit<PMSProduct, 'id' | 'created_at' | 'updated_at'>) {
    const { data: product, error } = await supabase
      .from(pmsProductTable)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return product;
  },

  async update(id: string, data: Partial<PMSProduct>) {
    const { data: product, error } = await supabase
      .from(pmsProductTable)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return product;
  }
};
