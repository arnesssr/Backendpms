import { Request, Response, NextFunction } from 'express';
import { SecurityHeaders, ValidationResponse } from '../types/security';
import crypto from 'crypto';

const TIMESTAMP_TOLERANCE = 300000; // 5 minutes in milliseconds
const usedNonces = new Set<string>();

export const validateSecurityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = req.header('X-Request-Signature');
  const timestamp = req.header('X-Request-Timestamp');
  const nonce = req.header('X-Request-Nonce');

  if (!signature || !timestamp || !nonce) {
    return res.status(401).json({ error: 'Missing security headers' });
  }

  const validationResult = validateHeaders({
    'X-Request-Signature': signature,
    'X-Request-Timestamp': timestamp,
    'X-Request-Nonce': nonce
  }, req.body);

  if (!validationResult.isValid) {
    return res.status(401).json({ error: validationResult.error });
  }

  next();
};

function validateHeaders(headers: SecurityHeaders, requestBody: any): ValidationResponse {
  // Validate timestamp
  const requestTime = parseInt(headers['X-Request-Timestamp']);
  const currentTime = Date.now();
  
  if (Math.abs(currentTime - requestTime) > TIMESTAMP_TOLERANCE) {
    return { isValid: false, error: 'Request timestamp expired' };
  }

  // Check nonce replay
  if (usedNonces.has(headers['X-Request-Nonce'])) {
    return { isValid: false, error: 'Nonce already used' };
  }
  usedNonces.add(headers['X-Request-Nonce']);

  // Clean up old nonces (optional)
  setTimeout(() => usedNonces.delete(headers['X-Request-Nonce']), TIMESTAMP_TOLERANCE);

  // Verify signature
  if (!verifySignature(JSON.stringify(requestBody), headers['X-Request-Signature'], headers['X-Request-Timestamp'])) {
    return { isValid: false, error: 'Invalid signature' };
  }

  return { isValid: true };
}

function verifySignature(payload: string, signature: string, timestamp: string): boolean {
  const data = `${payload}:${timestamp}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.SECURITY_SIGNATURE_SECRET || '')
    .update(data)
    .digest('hex');
  
  return signature === expectedSignature;
}
