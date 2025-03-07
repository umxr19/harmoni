import express, { Router, RequestHandler } from 'express';
import { studyScheduleController } from '../controllers/studyScheduleController';
import { protect } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Protect all routes
router.use(protect);

// Get weekly study schedule
router.get('/weekly', studyScheduleController.getWeeklySchedule as RequestHandler);

// Refresh schedule to generate a new one
router.post('/refresh', studyScheduleController.refreshSchedule as RequestHandler);

export default router; 