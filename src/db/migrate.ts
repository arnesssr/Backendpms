import { db } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  try {
    // Step 1: Add columns if they don't exist
    await db`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'categories' AND column_name = 'updated_at'
        ) THEN
          ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'categories' AND column_name = 'created_at'
        ) THEN
          ALTER TABLE categories ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `;
    console.log('Columns added successfully');

    // Step 2: Create update_timestamp function
    await db`
      CREATE OR REPLACE FUNCTION update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    console.log('Function created successfully');

    // Step 3: Create trigger
    await db`
      DROP TRIGGER IF EXISTS update_categories_timestamp ON categories;
    `;
    
    await db`
      CREATE TRIGGER update_categories_timestamp
      BEFORE UPDATE ON categories
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();
    `;
    console.log('Trigger created successfully');

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
