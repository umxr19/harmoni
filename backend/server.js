const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fileUpload = require('express-fileupload');
const errorHandler = require('./middleware/errorHandler');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security headers
app.use(helmet());

// Compression middleware
app.use(compression());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Higher limit for mobile devices
    const userAgent = req.headers['user-agent'] || '';
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobile = mobileRegex.test(userAgent);
    
    // Student role in custom header (or from token)
    const isStudent = req.headers['x-user-role'] === 'student';
    
    // Allow more requests for mobile devices and students
    if (isMobile) {
      return 200; // Double the limit for mobile
    }
    return 100; // Default limit
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Enhanced CORS configuration
app.use(cors({
  // Allow connections from any origin during development
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Production domains
    : true, // Allow any origin in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`Request received: {
  method: '${req.method}',
  path: '${req.path}',
  body: ${JSON.stringify(req.body || {})},
  headers: ${JSON.stringify(req.headers || {})}
}`);
  
  console.log(`Request details: {
  fullUrl: '${req.method} ${req.originalUrl}',
  headers: ${JSON.stringify(req.headers || {})},
  body: ${JSON.stringify(req.body || {})},
  params: ${JSON.stringify(req.params || {})},
  query: ${JSON.stringify(req.query || {})}
}`);
  
  // Track response time
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`Response sent: {
  path: '${req.path}',
  statusCode: ${res.statusCode},
  duration: ${duration}ms
}`);
  });
  
  next();
});

// Raw body for Stripe webhooks
app.use('/api/purchases/webhook', express.raw({ type: 'application/json' }));

// Regular body parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/practice', require('./routes/practiceRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/classrooms', require('./routes/classroomRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));

// New store routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));

// New analytics routes
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/user/activity', require('./routes/analyticsRoutes'));

// Debug routes (only available in development)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', require('./routes/debugRoutes'));
  console.log('Debug routes enabled - access at /api/debug/*');
  
  // Mobile debug routes
  app.use('/api/mobile-debug', require('./routes/mobileDebugRoutes'));
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log(`API route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: {
      message: 'API Endpoint Not Found',
      details: `The requested endpoint ${req.originalUrl} does not exist`,
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    }
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set cache headers for static assets
  app.use(express.static(path.join(__dirname, '../frontend/build'), {
    maxAge: '30d',
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        // No cache for HTML files
        res.setHeader('Cache-Control', 'no-cache');
      } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
        // Cache for static assets
        res.setHeader('Cache-Control', 'public, max-age=2592000');
      }
    }
  }));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Use the global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at http://localhost:${PORT} and http://192.168.1.67:${PORT}`);
}); 