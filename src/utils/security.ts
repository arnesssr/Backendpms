import crypto from 'crypto';

export function generateSignature(timestamp: string, nonce: string, method: string, path: string): string {
  const secret = process.env.ENCRYPTION_KEY || '';
  const payload = `${timestamp}:${nonce}:${method}:${path}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifySignature(signature: string, timestamp: string, nonce: string, method: string, path: string): boolean {
  try {
    if (!signature || !timestamp || !nonce || !method || !path) {
      return false;
    }

    const expectedSignature = generateSignature(timestamp, nonce, method, path);
    
    // Ensure both signatures are same length hex strings
    const sigBuffer = Buffer.from(signature.padEnd(64, '0'), 'hex');
    const expectedBuffer = Buffer.from(expectedSignature.padEnd(64, '0'), 'hex');
    
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}
