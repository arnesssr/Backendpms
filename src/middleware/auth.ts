import { Request, Response, NextFunction } from 'express'
import clerk from '@clerk/backend'

const clerkClient = clerk

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

export const auth = async (req: Request, res: Response, next: NextFunction) => {
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
        const session = await clerkClient.sessions.getSession(bearerToken)
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

export type AuthMiddleware = typeof auth