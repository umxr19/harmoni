import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware';
import { 
    createClassroom, 
    getClassrooms, 
    getClassroomById, 
    updateClassroom, 
    deleteClassroom,
    addStudent,
    removeStudent,
    getStudentClassrooms
} from '../controllers/classroomController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Teacher routes
router.post('/', authorizeRoles('teacher'), createClassroom);
router.get('/teacher', authorizeRoles('teacher'), getClassrooms);
router.get('/:id', authorizeRoles('teacher'), getClassroomById);
router.put('/:id', authorizeRoles('teacher'), updateClassroom);
router.delete('/:id', authorizeRoles('teacher'), deleteClassroom);

// Student management routes
router.post('/:id/students', authorizeRoles('teacher'), addStudent);
router.delete('/:id/students/:studentId', authorizeRoles('teacher'), removeStudent);

// Student routes
router.get('/student', authorizeRoles('student'), getStudentClassrooms);

export default router; 