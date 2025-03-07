import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';
import logger from '../utils/logger';
import config from '../config';

export interface JwtPayload extends BaseJwtPayload {
    id: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.replace('Bearer ', '');
        const jwtSecret = config.jwt.secret;

        if (!token || !jwtSecret) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token with proper type checking
            const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
            
            if (!decoded.id || !decoded.role) {
                throw new Error('Invalid token payload');
            }

            // Add user to request
            req.user = decoded;
            next();
        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access forbidden' });
        }

        next();
    };
};

// Middleware to ensure student access
export const ensureStudent = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    // Log student check for debugging
    logger.info('Student check:', {
        userRole: req.user.role,
        path: req.path
    });

    if (req.user.role !== 'student') {
        return res.status(403).json({
            error: 'Access denied',
            message: 'Only students can access this resource'
        });
    }

    next();
}; 