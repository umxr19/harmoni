import { Request, Response, NextFunction } from 'express';
import logger from "../utils/logger";

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler for development environment
const sendErrorDev = (err: AppError, res: Response) => {
  return res.status(err.statusCode).json({
    status: 'error',
    message: err.message,
    stack: err.stack,
    error: err
  });
};

// Error handler for production environment
const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }
  
  // Programming or other unknown error: don't leak error details
  logger.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

// Global error handler middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Default to 500 if statusCode not set
  const error = err instanceof AppError 
    ? err 
    : new AppError(err.message || 'Something went wrong', 500, false);
  
  // Log all errors
  logger.error(`${req.method} ${req.path} - ${error.statusCode}: ${error.message}`);
  
  // Send different error responses based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Middleware to handle 404 errors
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

// Middleware to handle async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 