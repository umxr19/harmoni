import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    username: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    if (!config.jwt.secret) {
      logger.error('JWT_SECRET is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        role: string;
        username: string;
      };

      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expired' });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 