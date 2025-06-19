import { Request, Response, NextFunction } from 'express';
import { SecurityError } from '../types/security';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key');
  const expectedApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== expectedApiKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Verify request signature if present
  const signature = req.header('X-Request-Signature');
  if (signature) {
    try {
      verifySignature(req);
    } catch (error) {
      if (error instanceof SecurityError) {
        return res.status(401).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal security error' });
    }
  }

  next();
};

function verifySignature(req: Request): void {
  // Implement signature verification logic here
  // This would typically involve creating a hash of the request body + timestamp + nonce
  // and comparing it with the provided signature
}
