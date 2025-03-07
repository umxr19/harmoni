"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
// Custom error class with status code
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Error handler for development environment
const sendErrorDev = (err, res) => {
    return res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
        stack: err.stack,
        error: err
    });
};
// Error handler for production environment
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }
    // Programming or other unknown error: don't leak error details
    logger_1.default.error('ERROR 💥', err);
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
    });
};
// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    // Default to 500 if statusCode not set
    const error = err instanceof AppError
        ? err
        : new AppError(err.message || 'Something went wrong', 500, false);
    // Log all errors
    logger_1.default.error(`${req.method} ${req.path} - ${error.statusCode}: ${error.message}`);
    // Send different error responses based on environment
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    }
    else {
        sendErrorProd(error, res);
    }
};
exports.errorHandler = errorHandler;
// Middleware to handle 404 errors
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Not found - ${req.originalUrl}`, 404);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
// Middleware to handle async errors
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
