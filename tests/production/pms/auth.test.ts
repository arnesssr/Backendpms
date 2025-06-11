import { describe, it, expect } from '@jest/globals';
import axios, { AxiosInstance } from 'axios';

describe('PMS Authentication', () => {
  const PMS_URL = 'https://inventra-frontend.vercel.app';
  const API_KEY = process.env.VITE_API_KEY;
  let api: AxiosInstance;

  beforeEach(() => {
    api = axios.create({
      baseURL: PMS_URL,
      timeout: 30000,
      validateStatus: () => true
    });
  });

  describe('API Key Authentication', () => {
    it('should verify valid API key access', async () => {
      const response = await api.get('/api/health', {
        headers: { 'x-api-key': API_KEY }
      });
      expect(response.status).toBe(200);
    });

    it('should reject invalid API key', async () => {
      const response = await api.get('/api/health', {
        headers: { 'x-api-key': 'invalid-key' }
      });
      expect(response.status).toBe(401);
    });

    it('should reject missing API key', async () => {
      const response = await api.get('/api/health');
      expect(response.status).toBe(401);
    });
  });
});

