import express from 'express';
import { protect } from '../middleware/authMiddleware';
import progressService from '../services/progressService';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types/express';

const router = express.Router();

// Record a new attempt
router.post('/attempts', protect, async (req: AuthenticatedRequest, res) => {
  try {
    const { questionId, selectedOption, isCorrect, timeSpent } = req.body;
    const userId = req.user.id;
    
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
router.get('/stats', protect, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const stats = await progressService.getUserProgress(userId);
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching progress stats:', error);
    res.status(500).json({ error: 'Failed to fetch progress stats' });
  }
});

// Get personalized recommendations
router.get('/recommendations', protect, async (req: AuthenticatedRequest, res) => {
  try {
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
router.get('/', protect, async (req: AuthenticatedRequest, res) => {
  try {
    const progress = await progressService.getUserProgress(req.user.id);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress' });
  }
});

// Get category progress
router.get('/category/:category', protect, async (req: AuthenticatedRequest, res) => {
  try {
    const progress = await progressService.getCategoryProgress(req.user.id, req.params.category);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category progress' });
  }
});

// Get parent's children
router.get('/children', protect, async (req: AuthenticatedRequest, res) => {
  try {
    const children = await progressService.getParentChildren(req.user.id);
    res.json(children);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching children' });
  }
});

// Get child's recent activity
router.get('/child/:childId/activity', protect, async (req: AuthenticatedRequest, res) => {
  try {
    const activity = await progressService.getChildRecentActivity(req.params.childId);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching child activity' });
  }
});

export default router; 