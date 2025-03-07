import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { 
    startPractice, 
    submitAnswer, 
    getPracticeSession, 
    getPracticeHistory,
    getPracticeSet,
    getAllPracticeSets
} from '../controllers/practiceController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Practice sets routes - must come before parameterized routes
router.get('/sets', getAllPracticeSets);
router.get('/sets/:id', getPracticeSet);

// History route - must come before parameterized routes
router.get('/history', getPracticeHistory);

// Practice session routes
router.post('/start', startPractice);
router.post('/:sessionId/answer', submitAnswer);
router.get('/:sessionId', getPracticeSession);

export default router; 