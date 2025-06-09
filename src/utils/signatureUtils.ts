import crypto from 'crypto';
import { SignaturePayload } from '../types/security';

export class SignatureUtils {
  // Generate signature for outgoing requests
  static generateSignature(payload: SignaturePayload): string {
    const data = this.prepareSignatureData(payload);
    return crypto
      .createHmac('sha256', process.env.SECURITY_SIGNATURE_SECRET || '')
      .update(data)
      .digest('hex');
  }

  // Verify incoming request signatures
  static verifySignature(payload: SignaturePayload, providedSignature: string): boolean {
    const expectedSignature = this.generateSignature(payload);
    return crypto.timingSafeEqual(
      Buffer.from(providedSignature),
      Buffer.from(expectedSignature)
    );
  }

  private static prepareSignatureData(payload: SignaturePayload): string {
    return `${JSON.stringify(payload.body)}:${payload.timestamp}:${payload.nonce}`;
  }
}
