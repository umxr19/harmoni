const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

/**
 * @route   GET /api/debug/routes
 * @desc    List all registered routes
 * @access  Public (development only)
 */
router.get('/routes', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Debug routes are disabled in production' });
  }
  
  const routes = [];
  
  // Get the Express app from the request
  const app = req.app;
  
  // Function to extract routes from a layer
  const extractRoutes = (layer, basePath = '') => {
    if (layer.route) {
      // It's a route
      const path = basePath + (layer.route.path || '');
      const methods = Object.keys(layer.route.methods)
        .filter(method => layer.route.methods[method])
        .map(method => method.toUpperCase());
      
      routes.push({
        path,
        methods,
        middleware: layer.route.stack.map(handler => handler.name || 'anonymous')
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      // It's a router
      const path = basePath + (layer.regexp.toString().replace(/[^/]*$/, '') || '');
      
      layer.handle.stack.forEach(stackItem => {
        extractRoutes(stackItem, path);
      });
    }
  };
  
  // Extract routes from all layers
  app._router.stack.forEach(layer => {
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
router.get('/auth', auth, (req, res) => {
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
  error.statusCode = code;
  
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

module.exports = router; 