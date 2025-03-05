import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import logger from "../utils/logger";

// Define different rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiter
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      status: 'error',
      message: 'Too many requests from this IP, please try again later'
    },
    handler: (req: Request, res: Response) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, path: ${req.path}`);
      res.status(429).json({
        status: 'error',
        message: 'Too many requests from this IP, please try again later'
      });
    }
  }),

  // Authentication endpoints rate limiter (more strict)
  auth: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login/register attempts per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: 'Too many authentication attempts, please try again later'
    },
    handler: (req: Request, res: Response) => {
      logger.warn(`Auth rate limit exceeded for IP: ${req.ip}, path: ${req.path}`);
      res.status(429).json({
        status: 'error',
        message: 'Too many authentication attempts, please try again later'
      });
    }
  }),

  // Password reset rate limiter (very strict)
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset attempts per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: 'Too many password reset attempts, please try again later'
    },
    handler: (req: Request, res: Response) => {
      logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        status: 'error',
        message: 'Too many password reset attempts, please try again later'
      });
    }
  }),

  // Store/product endpoints rate limiter
  store: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: 'Too many store requests, please try again later'
    }
  }),

  // Admin endpoints rate limiter
  admin: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // Limit each IP to 60 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: 'Too many admin requests, please try again later'
    }
  })
}; 