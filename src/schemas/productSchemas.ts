import { z } from 'zod';
import { supabase } from '../config/supabaseClient';

interface ProductData {
  name: string;
  price: number;
  description?: string;
}

export const productSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.string(),
  image_urls: z.array(z.string().url()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft')
}).refine(data => {
  // Cross-field validation
  if (data.status === 'published' && !data.description) {
    return false;
  }
  return true;
}, {
  message: "Published products must have a description"
});

export const productBusinessRules = {
  checkDuplicateName: async (data: ProductData) => {
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('name', data.name)
      .maybeSingle();
    
    return !existing;
  },
  
  validatePriceRange: (data: ProductData) => {
    return data.price >= 0.01 && data.price <= 999999.99;
  }
};
