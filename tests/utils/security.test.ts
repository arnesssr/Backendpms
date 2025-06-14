import { describe, it, expect, beforeAll } from '@jest/globals';
import { generateSignature, verifySignature } from '../../src/utils/security';

describe('Security Utils', () => {
  const testData = {
    timestamp: '1647083554000',
    nonce: 'test-nonce-123',
    method: 'GET',
    path: '/api/test'
  };

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'test-secret-key';
  });

  describe('generateSignature', () => {
    it('should generate a valid signature string', () => {
      const signature = generateSignature(
        testData.timestamp,
        testData.nonce,
        testData.method,
        testData.path
      );
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64); // SHA-256 hex string
    });

    it('should generate consistent signatures for same input', () => {
      const sig1 = generateSignature(
        testData.timestamp,
        testData.nonce,
        testData.method,
        testData.path
      );
      const sig2 = generateSignature(
        testData.timestamp,
        testData.nonce,
        testData.method,
        testData.path
      );
      expect(sig1).toBe(sig2);
    });
  });

  describe('verifySignature', () => {
    it('should verify valid signatures', () => {
      const signature = generateSignature(
        testData.timestamp,
        testData.nonce,
        testData.method,
        testData.path
      );
      expect(verifySignature(
        signature,
        testData.timestamp,
        testData.nonce,
        testData.method,
        testData.path
      )).toBe(true);
    });

    it('should reject invalid signatures', () => {
      const invalidSig = 'invalid'.padEnd(64, '0');
      expect(verifySignature(
        invalidSig,
        testData.timestamp,
        testData.nonce,
        testData.method,
        testData.path
      )).toBe(false);
    });
  });
});
