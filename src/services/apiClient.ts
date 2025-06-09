import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { SignatureUtils } from '../utils/signatureUtils';
import { RetryUtils } from '../utils/retry';
import crypto from 'crypto'; // Add this import

export class ApiClient {
  private static instance: ApiClient;
  private client: AxiosInstance;

  private constructor() {
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add security headers to outgoing requests
    this.client.interceptors.request.use(config => {
      const timestamp = Date.now().toString();
      const nonce = crypto.randomBytes(16).toString('hex'); // This now works correctly
      
      config.headers['X-Request-Timestamp'] = timestamp;
      config.headers['X-Request-Nonce'] = nonce;
      config.headers['X-Request-Signature'] = SignatureUtils.generateSignature({
        body: config.data,
        timestamp,
        nonce
      });

      return config;
    });
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    return RetryUtils.withRetry(
      () => this.client.request<T>(config).then(res => res.data),
      { maxAttempts: 3, delay: 1000, backoff: 2 }
    );
  }
}
