import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export const axiosInstance = axios.create({
  baseURL: process.env.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.API_KEY
  },
  validateStatus: (status) => status < 500
});
