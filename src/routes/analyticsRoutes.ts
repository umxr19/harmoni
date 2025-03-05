import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import { AnalyticsController } from '../controllers/analyticsController';

const router = express.Router();
const analyticsController = new AnalyticsController();

// All routes require authentication
router.use(authenticateJWT);

// Student analytics routes
router.get('/student/current', authorizeRoles('student'), analyticsController.getStudentAnalytics);
router.get('/student/:userId', authorizeRoles('teacher', 'admin'), analyticsController.getStudentAnalytics);

// Progress route with authorization check
router.get('/progress/:userId', async (req, res, next) => {
    // Allow students to view their own progress or teachers to view any student's progress
    if (req.user!.role === 'student' && req.params.userId !== req.user!.id) {
        return res.status(403).json({ message: 'Access forbidden' });
    }
    next();
}, analyticsController.getStudentProgress);

// Teacher analytics routes
router.get('/teacher', authorizeRoles('teacher'), analyticsController.getTeacherAnalytics);

export default router; 