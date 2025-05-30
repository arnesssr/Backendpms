import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export const storage = supabase.storage;

// Create bucket if it doesn't exist
export const initializeStorage = async () => {
  const { data: buckets } = await storage.listBuckets();
  
  if (!buckets?.find(b => b.name === 'product-images')) {
    await storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 1024 * 1024 * 2 // 2MB
    });
  }
};
