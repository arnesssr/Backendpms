import { Request, Response, NextFunction } from 'express';
import { Clerk } from '@clerk/clerk-sdk-node';
import { verifySignature } from '../utils/security';

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export async function verifyApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Check API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing API key' });
    }

    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // 2. Verify bearer token if present
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const [sessionId, sessionToken] = authHeader.split(' ')[1].split(':');
      if (sessionId && sessionToken) {
        try {
          await clerk.sessions.verifySession(sessionId, sessionToken);
        } catch (error) {
          return res.status(401).json({ error: 'Invalid session' });
        }
      }
    }

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// Add export for status check
export function getAuthStatus(): boolean {
  return Boolean(process.env.CLERK_SECRET_KEY && process.env.API_KEY);
}
