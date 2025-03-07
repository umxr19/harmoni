import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getUserProfile, updateUserProfile, UserController } from '../controllers/userController';

const router = express.Router();
const userController = new UserController();

// All routes require authentication
router.use(protect);

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Progress and analytics routes
router.get('/progress', userController.getProgress.bind(userController));

// Teacher routes
router.get('/students', userController.getTeacherStudents.bind(userController));

export default router; 