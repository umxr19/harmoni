const express = require('express');
const router = express.Router();

/**
 * Mobile debugging routes
 * These routes are specifically designed to help troubleshoot mobile API issues
 */

// Test basic connectivity
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Mobile API connection successful',
    timestamp: new Date().toISOString()
  });
});

// Echo back request information
router.get('/echo', (req, res) => {
  res.json({
    success: true,
    request: {
      headers: req.headers,
      ip: req.ip,
      method: req.method,
      path: req.path,
      query: req.query,
      protocol: req.protocol,
      secure: req.secure,
      originalUrl: req.originalUrl,
      hostname: req.hostname
    }
  });
});

module.exports = router;
