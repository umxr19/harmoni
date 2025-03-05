const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Verify user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Log token information for debugging (redacted for security)
    console.log(`Auth middleware - Request path: ${req.path}`);
    console.log(`Auth middleware - Token present: ${!!token}`);
    
    // Special handling for mock-token in development
    if (token === 'mock-token' && (process.env.NODE_ENV !== 'production')) {
      console.log('Development mode: proceeding with mock token');
      req.user = {
        id: '123456789012345678901234', // Mock MongoDB ObjectId
        email: 'test@example.com',
        role: 'student'
      };
      return next();
    }
    
    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ 
        message: 'No authentication token, access denied',
        details: 'Please provide a valid authentication token in the Authorization header'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log(`Auth middleware - Token verified for user ID: ${decoded.id}`);
      
      // Find user by id
      const user = await User.findById(decoded.id);
      
      if (!user) {
        console.log(`Auth middleware - User not found for ID: ${decoded.id}`);
        return res.status(401).json({ 
          message: 'User not found',
          details: 'The user associated with this token no longer exists'
        });
      }
      
      // Add user to request
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role
      };
      
      console.log(`Auth middleware - User authenticated: ${user.email} (${user.role})`);
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      // For development, allow requests to proceed with a mock user
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: proceeding with mock user');
        req.user = {
          id: '123456789012345678901234', // Mock MongoDB ObjectId
          email: 'test@example.com',
          role: 'student'
        };
        return next();
      }
      
      // Provide more detailed error message based on the error type
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired',
          details: 'Your session has expired. Please log in again.'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token',
          details: 'The authentication token provided is malformed or invalid.'
        });
      }
      
      res.status(401).json({ 
        message: 'Token is not valid',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: 'An unexpected error occurred while authenticating your request.'
    });
  }
};

/**
 * Authorize by role
 * @param  {...string} roles - Allowed roles
 * @returns {Function} - Express middleware
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('Authorization middleware - No user in request');
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`Authorization middleware - User role ${req.user.role} not authorized for this route. Required roles: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`,
        details: `This action requires one of the following roles: ${roles.join(', ')}`
      });
    }
    
    console.log(`Authorization middleware - User role ${req.user.role} authorized for this route`);
    next();
  };
}; 