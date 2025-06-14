import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import axios, { AxiosInstance } from 'axios';

describe('External API Connection Tests', () => {
  const API_KEY = process.env.API_KEY;
  let api: AxiosInstance;
  const cancelTokens: AbortController[] = [];

  describe('PMS API Connection', () => {
    it('should verify PMS API is accessible', async () => {
      const response = await axios.get('https://inventra-frontend.vercel.app/api/health', {
        headers: { 'x-api-key': API_KEY }
      });
      expect(response.status).toBe(200);
    });
  });

  describe('Cloudinary API Connection', () => {
    it('should verify Cloudinary API is accessible', async () => {
      const response = await axios.get(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/ping`, {
        auth: {
          username: process.env.CLOUDINARY_API_KEY || '',
          password: process.env.CLOUDINARY_API_SECRET || ''
        }
      });
      expect(response.status).toBe(200);
    });
  });

  describe('Storefront API Connection', () => {
    it('should verify Storefront API is accessible', async () => {
      const response = await axios.get(process.env.STOREFRONT_URL + '/api/health');
      expect(response.status).toBe(200);
    });
  });

  describe('Webhook Endpoint', () => {
    it('should verify webhook endpoint is accessible', async () => {
      const response = await axios.post(process.env.WEBHOOK_URL + '/test', {
        test: true
      }, {
        headers: { 'x-webhook-secret': process.env.WEBHOOK_SECRET }
      });
      expect(response.status).toBe(200);
    });
  });
});
