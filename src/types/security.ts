export interface SecurityHeaders {
  'X-Request-Signature': string;
  'X-Request-Timestamp': string;
  'X-Request-Nonce': string;
}

export interface ValidationResponse {
  isValid: boolean;
  error?: string;
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}
