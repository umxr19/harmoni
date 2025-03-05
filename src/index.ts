import dotenv from 'dotenv';
import logger from './utils/logger';
// Load environment variables before any other imports
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import questionRoutes from './routes/questionRoutes';
import userRoutes from './routes/userRoutes';
import practiceRoutes from './routes/practiceRoutes';
import progressRoutes from './routes/progressRoutes';
import examRoutes from './routes/examRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/question-bank')
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/exams', examRoutes);

// Add this after your routes are registered
logger.info('Registered routes:');
app._router.stack.forEach((middleware: any) => {
  if (middleware.route) {
    // Routes registered directly
    logger.info(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    // Router middleware
    middleware.handle.stack.forEach((handler: any) => {
      if (handler.route) {
        const path = handler.route.path;
        const methods = Object.keys(handler.route.methods);
        logger.info(`${methods} /api${middleware.regexp.source.replace('\\/?(?=\\/|$)', '')}${path}`);
      }
    });
  }
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
}); 