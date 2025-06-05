import { supabase } from '../../config/database';

export const seedDatabase = async () => {
  try {
    // Add seed data
    const { error } = await supabase.from('products').insert([
      // Add sample data
    ]);

    if (error) throw error;
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}
