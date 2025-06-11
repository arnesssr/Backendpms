import { supabase } from '../../config/database';

export class PMSPersistenceService {
  async saveProduct(data: any): Promise<any> {
    const { error } = await supabase
      .from('products')
      .insert([data]);

    if (error) throw error;

    return data;
  }

  async updateProduct(id: string, data: any): Promise<any> {
    const { error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id);

    if (error) throw error;

    return data;
  }

  async updateInventory(adjustment: {
    productId: string;
    type: 'increase' | 'decrease';
    quantity: number;
    reason: string;
  }): Promise<any> {
    // Start Supabase transaction
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', adjustment.productId)
      .single();

    if (productError) throw productError;
    if (!product) throw new Error('Product not found');

    // Create inventory movement
    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert([{
        product_id: adjustment.productId,
        type: adjustment.type,
        quantity: adjustment.quantity,
        reason: adjustment.reason
      }]);

    if (movementError) throw movementError;

    // Update product stock
    const newStock = adjustment.type === 'increase' 
      ? product.stock + adjustment.quantity 
      : product.stock - adjustment.quantity;

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', adjustment.productId);

    if (updateError) throw updateError;

    return { 
      product: { ...product, stock: newStock },
      movement: adjustment
    };
  }
}

export const pmsPersistence = new PMSPersistenceService();
