import { db } from '../config/database';

export default async () => {
  // Close database connection
  await db.end();
  
  // Allow time for network connections to close
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Force exit after cleanup
  process.exit(0);
};
