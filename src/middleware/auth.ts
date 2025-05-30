import { Request, Response, NextFunction } from 'express'
import { Clerk } from '@clerk/backend'

// Initialize Clerk with proper typing
const clerk = new Clerk({ 
  secretKey: process.env.CLERK_SECRET_KEY || '' 
})


declare global {
  namespace Express {
    interface Request {
      user?: string
      auth?: {
        userId: string
      }
    }
  }
}

// Define RequestHandler type for auth middleware
type AuthHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

// Export auth middleware with correct type
export const auth: AuthHandler = async (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  const bearerToken = req.headers.authorization?.split(' ')[1]

  try {
    // Check API key for Storefront requests
    if (apiKey === process.env.API_KEY) {
      return next()
    }

    // Check Clerk session for PMS requests
    if (bearerToken) {
      try {
        // Changed from verifySession to verifyToken
        const session = await clerk.sessions.verifyToken(bearerToken)
        if (session) {
          req.user = session.userId
          req.auth = { userId: session.userId }
          return next()
        }
      } catch (error) {
        console.error('Session verification error:', error)
      }
    }

    res.status(401).json({ error: 'Unauthorized' })
  } catch (error) {
    console.error('Auth Error:', error)
    res.status(401).json({ error: 'Authentication failed' })
  }
}

// Validate API Key middleware
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'API key is required' });
  }
  next();
};

// Export type for use in routes
export type AuthMiddleware = typeof auth
