import { PoolConfig } from 'pg';

// Extend the existing Database interface
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          category_id: string
          status: 'draft' | 'published' | 'archived'
          image_urls: string[]
          stock: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          image_url?: string
          created_at: string
        }
      }
      sections: {
        Row: {
          id: string
          name: string
          type: 'hero' | 'featured' | 'new' | 'category'
          active: boolean
          created_at: string
        }
      }
      product_sections: {
        Row: {
          product_id: string
          section_id: string
          position: number
          created_at: string
        }
      }
      inventory: {
        Row: {
          product_id: string
          stock: number
          min_stock: number
          updated_at: string
        }
      }
    }
  }
}

// Add DatabaseConfig interface
export interface DatabaseConfig extends PoolConfig {
  connectionString?: string; // Add this property
  ssl?: {
    rejectUnauthorized: boolean;
  };
  connectionTimeoutMillis?: number;
  max?: number;
}

// Add Pool methods interface
declare module 'pg' {
  interface Pool {
    end(): Promise<void>;
    // Add other Pool methods if needed
  }
}
