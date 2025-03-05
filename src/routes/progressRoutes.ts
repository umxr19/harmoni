import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import ProgressService from '../services/progressService';
import logger from '../utils/logger';

const router = express.Router();
const progressService = new ProgressService();

// Record a new attempt
router.post('/attempts', authenticateJWT, async (req, res) => {
  try {
    const { questionId, selectedOption, isCorrect, timeSpent } = req.body;
    const userId = req.user!.id;
    
    const attempt = await progressService.recordAttempt({
      userId,
      questionId,
      selectedOption,
      isCorrect,
      timeSpent
    });
    
    res.status(201).json(attempt);
  } catch (error) {
    logger.error('Error recording attempt:', error);
    res.status(500).json({ error: 'Failed to record attempt' });
  }
});

// Get user progress stats
router.get('/stats', authenticateJWT, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    const stats = await progressService.getUserProgress(userId);
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching progress stats:', error);
    res.status(500).json({ error: 'Failed to fetch progress stats' });
  }
});

// Get personalized recommendations
router.get('/recommendations', authenticateJWT, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    const recommendations = await getSimpleRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    logger.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Helper function for recommendations
async function getSimpleRecommendations(userId: string) {
  return {
    recommendedTopics: ['Algebra', 'Grammar', 'Reading Comprehension'],
    recommendedQuestions: [],
    message: 'Based on your recent activity, we recommend focusing on these areas.'
  };
}

// Get user progress
router.get('/', authenticateJWT, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const progress = await progressService.getUserProgress(req.user.id);
    res.json(progress);
  } catch (error) {
    logger.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get progress for a specific category
router.get('/category/:category', authenticateJWT, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const progress = await progressService.getCategoryProgress(req.user.id, req.params.category);
    res.json(progress);
  } catch (error) {
    logger.error('Error fetching category progress:', error);
    res.status(500).json({ error: 'Failed to fetch category progress' });
  }
});

// Get children for a parent user
router.get('/children', authenticateJWT, authorizeRoles('parent'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const children = await progressService.getParentChildren(req.user.id);
    res.json(children);
  } catch (error) {
    logger.error('Error fetching children:', error);
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// Get a child's recent activity
router.get('/child/:childId/activity', authenticateJWT, authorizeRoles('parent'), async (req, res) => {
  try {
    const activity = await progressService.getChildRecentActivity(req.params.childId);
    res.json(activity);
  } catch (error) {
    logger.error('Error fetching child activity:', error);
    res.status(500).json({ error: 'Failed to fetch child activity' });
  }
});

export default router; 