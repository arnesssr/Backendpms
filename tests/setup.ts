import dotenv from 'dotenv';

// Load environment first
process.env.NODE_ENV = 'test';
dotenv.config();

// No global Redis initialization
