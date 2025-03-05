/**
 * Global error handler middleware
 * Provides consistent error responses across the API
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error('Error Handler:', err);
  
  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';
  let details = err.details || undefined;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation Error';
    details = Object.values(err.errors).map(error => error.message);
  } else if (err.name === 'CastError') {
    // Mongoose cast error (invalid ID)
    statusCode = 400;
    message = 'Invalid ID format';
    details = `The provided ID "${err.value}" is not valid`;
  } else if (err.code === 11000) {
    // Mongoose duplicate key error
    statusCode = 400;
    message = 'Duplicate Key Error';
    details = `The ${Object.keys(err.keyValue)[0]} "${Object.values(err.keyValue)[0]}" already exists`;
  } else if (err.name === 'JsonWebTokenError') {
    // JWT error
    statusCode = 401;
    message = 'Invalid Token';
    details = 'Authentication failed due to an invalid token';
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired
    statusCode = 401;
    message = 'Token Expired';
    details = 'Your session has expired, please log in again';
  }
  
  // Send the error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      details,
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = errorHandler; 