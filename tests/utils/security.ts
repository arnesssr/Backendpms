import crypto from 'crypto';

export function generateSignature(
  timestamp: string,
  nonce: string,
  method: string,
  path: string,
  body?: string
): string {
  const secret = process.env.SECURITY_SIGNATURE_SECRET || '';
  const payload = `${timestamp}:${nonce}:${method}:${path}${body ? `:${body}` : ''}`;
  
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}
