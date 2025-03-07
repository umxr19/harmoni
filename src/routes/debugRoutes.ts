import express, { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { redisService } from '../services/redisService';

const router = Router();

/**
 * @route   GET /api/debug/ping
 * @desc    Simple ping endpoint to check if the API is reachable
 * @access  Public
 */
router.get('/ping', (req, res) => {
  logger.info('Ping request received from:', req.ip);
  res.json({ 
    status: 'ok',
    message: 'API is reachable',
    timestamp: new Date().toISOString(),
    clientIp: req.ip,
    env: process.env.NODE_ENV,
    serverTime: new Date().toISOString()
  });
});

/**
 * @route   GET /api/debug/database
 * @desc    Check database connection status
 * @access  Public
 */
router.get('/database', (req, res) => {
  logger.info('Database status check from:', req.ip);
  const connectionState = mongoose.connection.readyState;
  
  // Map mongoose connection states to human-readable values
  const stateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };

  const status = {
    connected: connectionState === 1,
    state: stateMap[connectionState] || 'unknown',
    timestamp: new Date().toISOString(),
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    env: process.env.NODE_ENV
  };

  logger.info('Database status:', status);
  res.json(status);
});

/**
 * @route   GET /api/debug/routes
 * @desc    List all registered routes
 * @access  Public (development only)
 */
router.get('/routes', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Debug routes are disabled in production' });
  }
  
  const routes: any[] = [];
  
  // Get the Express app from the request
  const app = req.app;
  
  // Function to extract routes from a layer
  const extractRoutes = (layer: any, basePath = '') => {
    if (layer.route) {
      // It's a route
      const path = basePath + (layer.route.path || '');
      const methods = Object.keys(layer.route.methods)
        .filter(method => layer.route.methods[method])
        .map(method => method.toUpperCase());
      
      routes.push({
        path,
        methods,
        middleware: layer.route.stack.map((handler: any) => handler.name || 'anonymous')
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      // It's a router
      const path = basePath + (layer.regexp.toString().replace(/[^/]*$/, '') || '');
      
      layer.handle.stack.forEach((stackItem: any) => {
        extractRoutes(stackItem, path);
      });
    }
  };
  
  // Extract routes from all layers
  app._router.stack.forEach((layer: any) => {
    extractRoutes(layer);
  });
  
  res.json({
    count: routes.length,
    routes: routes.sort((a, b) => a.path.localeCompare(b.path))
  });
});

/**
 * @route   GET /api/debug/auth
 * @desc    Test authentication
 * @access  Private
 */
router.get('/auth', protect, (req, res) => {
  res.json({
    message: 'Authentication successful',
    user: req.user
  });
});

/**
 * @route   GET /api/debug/error/:code
 * @desc    Test error handling with different status codes
 * @access  Public (development only)
 */
router.get('/error/:code', (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Debug routes are disabled in production' });
  }
  
  const code = parseInt(req.params.code) || 500;
  const error = new Error(`Test error with status code ${code}`);
  (error as any).statusCode = code;
  
  next(error);
});

/**
 * @route   GET /api/debug/headers
 * @desc    Echo request headers
 * @access  Public (development only)
 */
router.get('/headers', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Debug routes are disabled in production' });
  }
  
  res.json({
    headers: req.headers,
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query
  });
});

// Add mobile ping endpoint for testing
router.get('/mobile-ping', (req, res) => {
  res.json({
    success: true,
    message: 'Mobile API connection successful',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    ip: req.ip
  });
});

/**
 * @route   POST /api/debug/test-rate-limit
 * @desc    Test rate limiting without using OpenAI tokens
 * @access  Private
 */
router.post('/test-rate-limit', protect, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check rate limit using Redis service
    const rateLimitCheck = await redisService.checkRateLimit(userId);
    const remainingRequests = await redisService.getRemainingRequests(userId);

    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: rateLimitCheck.error || 'Rate limit exceeded',
        remainingRequests
      });
    }

    // If we get here, the request is allowed
    res.json({
      success: true,
      message: 'Request allowed',
      remainingRequests
    });
  } catch (error) {
    logger.error('Error in test-rate-limit:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error testing rate limit'
    });
  }
});

export default router; 