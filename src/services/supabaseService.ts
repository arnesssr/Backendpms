import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables')
}

// Initialize Supabase client
export const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// Helper functions for common operations
export const supabaseService = {
  products: {
    async getAll() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
      if (error) throw error
      return data
    },
    
    async create(product: any) {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
      if (error) throw error
      return data[0]
    }
  },

  categories: {
    async getAll() {
      const { data, error } = await supabase
        .from('categories')  
        .select('*')
      if (error) throw error
      return data
    }
  },

  inventory: {
    async getStock(productId: string) {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('product_id', productId)
        .single()
      if (error) throw error
      return data
    }
  },

  // Add realtime subscriptions setup
  setupRealtimeSubscriptions() {
    // Products changes
    const productsSubscription = supabase
      .channel('products_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, (payload: RealtimePostgresChangesPayload<{
        [key: string]: any
      }>) => {
        console.log('Product change received:', payload)
      })
      .subscribe()

    // Inventory changes  
    const inventorySubscription = supabase
      .channel('inventory_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory'
      }, (payload: RealtimePostgresChangesPayload<{
        [key: string]: any
      }>) => {
        console.log('Inventory change received:', payload)
      })
      .subscribe()

    return () => {
      productsSubscription.unsubscribe()
      inventorySubscription.unsubscribe()
    }
  }
}
