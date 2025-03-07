import express from 'express';
import { protect } from '../middleware/authMiddleware';
import * as activityController from '../controllers/activityController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Log a new activity
router.post('/user/activity', activityController.logActivity);

// Get user analytics
router.get('/analytics/user', activityController.getUserAnalytics);

// Get user activity history
router.get('/user/activity', activityController.getUserActivity);

// Get analytics for a specific category
router.get('/analytics/category/:category', activityController.getCategoryAnalytics);

export default router; 