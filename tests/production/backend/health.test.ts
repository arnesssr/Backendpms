import { describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
import axios, { AxiosInstance } from 'axios';

interface HealthResponse {
  status: string;
  timestamp: string;
  checks: {
    database: { healthy: boolean; latency: number };
    redis: { healthy: boolean; latency: number; timestamp: string };
    memory: { 
      healthy: boolean;
      usage: { heapTotal: number; heapUsed: number; rss: number }
    };
    websocket: { healthy: boolean; connections: number };
  };
}

describe('Production Backend Health', () => {
  const BACKEND_URL = process.env.BACKEND_URL || 'https://backendpms-wvoo.onrender.com';
  let api: AxiosInstance;
  const cancelTokens: AbortController[] = [];

  beforeEach(() => {
    api = axios.create({
      baseURL: BACKEND_URL,
      timeout: 30000, // 30 second timeout
      validateStatus: () => true // Don't throw on error status codes
    });
  });

  afterEach(async () => {
    // Cancel any pending requests
    cancelTokens.forEach(controller => controller.abort());
    cancelTokens.length = 0;
  });

  afterAll(async () => {
    // Ensure all connections are closed
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  it('should verify backend is running and healthy', async () => {
    const controller = new AbortController();
    cancelTokens.push(controller);
    
    const response = await api.get('/health', {
      signal: controller.signal
    });
    
    const health = response.data as HealthResponse;
    
    expect(response.status).toBe(200);
    expect(health.status).toBe('ok');
    expect(health.timestamp).toBeDefined();
    expect(health.checks).toMatchObject({
      database: { healthy: true },
      redis: { healthy: true },
      memory: { healthy: true },
      websocket: { healthy: true }
    });
  }, 35000); // Test timeout of 35 seconds
});
