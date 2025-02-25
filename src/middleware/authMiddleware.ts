import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader);

        const token = authHeader && authHeader.split(' ')[1];
        console.log('Extracted token:', token?.substring(0, 20) + '...');

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Log JWT secret info
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }
        console.log('JWT secret length:', secret.length);

        try {
            const decoded = jwt.verify(token, secret) as JwtPayload;
            console.log('Decoded token payload:', {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            });
            req.user = decoded;
            next();
        } catch (error) {
            if (error instanceof JsonWebTokenError) {
                console.error('JWT verification failed:', error.message);
                return res.status(403).json({ 
                    error: 'Token verification failed',
                    details: error.message 
                });
            }
            throw error;
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
};

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        console.log('Authorization check:', {
            user: req.user,
            requiredRoles: roles,
            hasRole: req.user && roles.includes(req.user.role)
        });
        
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `Unauthorized - Required roles: ${roles.join(', ')}, User role: ${req.user?.role}` 
            });
        }
        next();
    };
}; 