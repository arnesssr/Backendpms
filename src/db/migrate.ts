import { db } from '../config/database';
import fs from 'fs/promises';
import path from 'path';

export async function runMigrations() {
  try {
    // Get all SQL files from migrations directory
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    // Run each migration in order
    for (const file of sqlFiles) {
      console.log(`Running migration: ${file}`);
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      await db`${sql}`;
    }

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
