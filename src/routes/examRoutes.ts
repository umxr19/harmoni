import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import ExamService from '../services/examService';
import logger from '../utils/logger';

const router = express.Router();
const examService = new ExamService();

// Add this at the very top of your routes
router.get('/', (req, res) => {
  res.json({ message: 'Exam routes are working!' });
});

// Get all public exams
router.get('/public', async (req, res) => {
  try {
    const exams = await examService.getPublicExams();
    res.json(exams);
  } catch (error) {
    logger.error('Error fetching public exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Get exams created by a teacher
router.get('/teacher', authenticateJWT, authorizeRoles('teacher', 'admin'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const exams = await examService.getTeacherExams(req.user.id);
    res.json(exams);
  } catch (error) {
    logger.error('Error fetching teacher exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Get a specific exam
router.get('/:id', async (req, res) => {
  try {
    const exam = await examService.getExam(req.params.id);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    res.json(exam);
  } catch (error) {
    logger.error('Error fetching exam:', error);
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
});

// Create a new exam
router.post('/', authenticateJWT, authorizeRoles('teacher', 'admin'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const exam = await examService.createExam({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(exam);
  } catch (error) {
    logger.error('Error creating exam:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

// Start an exam attempt
router.post('/:id/start', authenticateJWT, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const attempt = await examService.startExam(req.params.id, req.user.id);
    res.status(201).json(attempt);
  } catch (error) {
    logger.error('Error starting exam:', error);
    res.status(500).json({ error: 'Failed to start exam' });
  }
});

// Submit an exam attempt
router.post('/:id/submit', authenticateJWT, async (req, res) => {
  try {
    const result = await examService.submitExam(req.body.attemptId, req.body.answers);
    res.json(result);
  } catch (error) {
    logger.error('Error submitting exam:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

// Get exam results
router.get('/:id/results/:attemptId', authenticateJWT, async (req, res) => {
  try {
    const results = await examService.getExamResults(req.params.attemptId);
    if (!results) {
      return res.status(404).json({ error: 'Exam results not found' });
    }
    res.json(results);
  } catch (error) {
    logger.error('Error fetching exam results:', error);
    res.status(500).json({ error: 'Failed to fetch exam results' });
  }
});

// Create sample exams (for testing)
router.post('/create-samples', authenticateJWT, authorizeRoles('teacher', 'admin'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    
    const result = await examService.createSampleExams(userId);
    res.json(result);
  } catch (error) {
    logger.error('Error creating sample exams:', error);
    res.status(500).json({ error: 'Failed to create sample exams' });
  }
});

export default router; 