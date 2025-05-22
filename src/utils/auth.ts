import { verify, sign, JwtPayload } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const verifyToken = (token: string): JwtPayload => {
  return verify(token, JWT_SECRET) as JwtPayload;
};

export const generateToken = (payload: object): string => {
  return sign(payload, JWT_SECRET, { expiresIn: '24h' });
};
