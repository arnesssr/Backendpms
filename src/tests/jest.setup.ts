import { jest } from '@jest/globals';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

jest.setTimeout(30000);

// Remove database setup code
