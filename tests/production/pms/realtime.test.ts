import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { io as Client } from 'socket.io-client';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { app, httpServer } from '../../../src/app';
import { redis } from '../../../src/config/redis';
import WebhookQueue from '../../../src/services/webhookQueueService';

interface ProductWebSocketEvent {
  id: string;
  name: string;
  price: number;
  category: string;
  timestamp: string;
  type: 'created' | 'updated' | 'deleted';
}

describe('PMS Real-time Database Tests', () => {
  let socket: any;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      httpServer.listen(3000, () => {
        console.log('Server started on port 3000');
        resolve();
      });
    });
    
    socket = Client('http://localhost:3000', {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false
    });

    // Wait for socket connection
    await new Promise<void>((resolve) => {
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        resolve();
      });
    });
  });

  it('should create product and trigger real-time updates', async () => {
    // Setup event listener before making request
    const eventPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket event timeout'));
      }, 5000);

      socket.once('product.created', (data: any) => {
        clearTimeout(timeout);
        try {
          expect(data).toHaveProperty('id');
          expect(data.name).toBe('Test Product');
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    // Make API request
    const response = await axios.post('http://localhost:3000/api/pms/products', {
      name: 'Test Product',
      description: 'Real-time test product',
      price: 99.99,
      category: 'test'
    }, {
      headers: { 'x-api-key': process.env.API_KEY }
    });

    expect(response.status).toBe(201);
    
    // Wait for WebSocket event
    await eventPromise;
  }, 30000);

  afterAll(async () => {
    if (socket?.connected) {
      socket.disconnect();
    }
    await new Promise(resolve => httpServer.close(resolve));
  });
});
