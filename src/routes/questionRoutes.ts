import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { 
    createQuestion, 
    getQuestions, 
    getQuestionById, 
    updateQuestion, 
    deleteQuestion 
} from '../controllers/questionController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Question management routes
router.post('/', authorizeRoles('teacher', 'admin'), createQuestion);
router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.put('/:id', authorizeRoles('teacher', 'admin'), updateQuestion);
router.delete('/:id', authorizeRoles('teacher', 'admin'), deleteQuestion);

export default router; 