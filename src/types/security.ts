export interface SecurityHeaders {
  'X-Request-Signature': string;
  'X-Request-Timestamp': string;
  'X-Request-Nonce': string;
}

export interface ValidationResponse {
  isValid: boolean;
  error?: string;
}

// Custom error for security-related issues
export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

// Types for signature verification
export interface SignaturePayload {
  body: any;
  timestamp: string;
  nonce: string;
}
