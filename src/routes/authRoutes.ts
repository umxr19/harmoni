import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { login, register, getCurrentUser } from '../controllers/authController';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/me', authenticateJWT, getCurrentUser);

export default router; 