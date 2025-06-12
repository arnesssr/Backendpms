import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import axios, { AxiosInstance } from 'axios';

describe('PMS API Integration Tests', () => {
  const BACKEND_URL = process.env.BACKEND_URL || 'https://backendpms-wvoo.onrender.com';
  const API_KEY = process.env.API_KEY;
  let api: AxiosInstance;
  const cancelTokens: AbortController[] = [];

  beforeEach(() => {
    api = axios.create({
      baseURL: BACKEND_URL,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      validateStatus: () => true
    });
  });

  afterEach(() => {
    cancelTokens.forEach(controller => controller.abort());
    cancelTokens.length = 0;
  });

  describe('Health Check', () => {
    it('should confirm API is accessible', async () => {
      const controller = new AbortController();
      cancelTokens.push(controller);
      
      const response = await api.get('/health', {
        signal: controller.signal,
        headers: {
          'x-api-key': API_KEY
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        status: 'ok',
        checks: {
          database: expect.any(Object),
          redis: expect.any(Object),
          memory: expect.any(Object)
        }
      });
    });
  });

  describe('API Integration Tests', () => {
    it('should verify API key authentication', async () => {
      const response = await api.get('/api/health', {
        headers: {
          'x-api-key': process.env.VITE_API_KEY
        }
      });
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('ok');
    });

    it('should reject invalid API key', async () => {
      const response = await api.get('/api/health', {
        headers: {
          'x-api-key': 'invalid-key'
        }
      });
      expect(response.status).toBe(401);
    });

    it('should reject missing API key', async () => {
      const response = await api.get('/api/health');
      expect(response.status).toBe(401);
    });
  });
});
