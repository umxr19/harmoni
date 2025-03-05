import express, { Request, Response } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import WellbeingService from '../services/wellbeingService';
import logger from '../utils/logger';

const router = express.Router();
const wellbeingService = new WellbeingService();

// Middleware to log requests
router.use((req: Request, res: Response, next) => {
  logger.info(`Wellbeing route requested: ${req.method} ${req.path}`);
  next();
});

/**
 * @route POST /api/wellbeing/mood-ratings
 * @desc Save a new mood rating
 * @access Private
 */
router.post('/mood-ratings', authenticateJWT, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { sessionId, examId, moodValue } = req.body;

    // Validate input
    if (!moodValue || moodValue < 1 || moodValue > 5) {
      return res.status(400).json({ error: 'Mood value must be between 1 and 5' });
    }

    if (!sessionId && !examId) {
      return res.status(400).json({ error: 'Either sessionId or examId must be provided' });
    }

    const moodRating = await wellbeingService.saveMoodRating(req.user.id, {
      sessionId,
      examId,
      moodValue
    });

    res.status(201).json(moodRating);
  } catch (error) {
    logger.error('Error saving mood rating:', error);
    res.status(500).json({ error: 'Failed to save mood rating' });
  }
});

/**
 * @route GET /api/wellbeing/mood-ratings
 * @desc Get mood ratings for the current user
 * @access Private
 */
router.get('/mood-ratings', authenticateJWT, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    const timeframe = req.query.timeframe as string;

    const moodRatings = await wellbeingService.getMoodRatings(req.user.id, limit, skip, timeframe);
    res.json(moodRatings);
  } catch (error) {
    logger.error('Error getting mood ratings:', error);
    res.status(500).json({ error: 'Failed to get mood ratings' });
  }
});

/**
 * @route GET /api/wellbeing/mood-ratings/average
 * @desc Get average mood rating for the current user
 * @access Private
 */
router.get('/mood-ratings/average', authenticateJWT, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const timeframe = req.query.timeframe as string;
    const averageMood = await wellbeingService.getAverageMoodRating(req.user.id, timeframe);
    res.json({ averageMood });
  } catch (error) {
    logger.error('Error getting average mood rating:', error);
    res.status(500).json({ error: 'Failed to get average mood rating' });
  }
});

/**
 * @route POST /api/wellbeing/journal
 * @desc Save a new journal entry
 * @access Private
 */
router.post('/journal', authenticateJWT, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { entryText, tags } = req.body;

    // Validate input
    if (!entryText) {
      return res.status(400).json({ error: 'Entry text is required' });
    }

    const journalEntry = await wellbeingService.saveJournalEntry(req.user.id, {
      entryText,
      tags
    });

    res.status(201).json(journalEntry);
  } catch (error) {
    logger.error('Error saving journal entry:', error);
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
});

/**
 * @route GET /api/wellbeing/journal
 * @desc Get journal entries for the current user
 * @access Private
 */
router.get('/journal', authenticateJWT, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    const timeframe = req.query.timeframe as string;

    const journalEntries = await wellbeingService.getJournalEntries(req.user.id, limit, skip, timeframe);
    res.json(journalEntries);
  } catch (error) {
    logger.error('Error getting journal entries:', error);
    res.status(500).json({ error: 'Failed to get journal entries' });
  }
});

/**
 * @route DELETE /api/wellbeing/journal/:id
 * @desc Delete a journal entry
 * @access Private
 */
router.delete('/journal/:id', authenticateJWT, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const entryId = req.params.id;
    
    // Delete the journal entry
    const result = await wellbeingService.deleteJournalEntry(req.user.id, entryId);
    
    if (!result) {
      return res.status(404).json({ error: 'Journal entry not found or you do not have permission to delete it' });
    }
    
    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    logger.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

/**
 * @route GET /api/wellbeing/study-hours
 * @desc Get total study hours for the current user
 * @access Private
 */
router.get('/study-hours', authenticateJWT, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const timeframe = req.query.timeframe as string;
    const totalStudyHours = await wellbeingService.getTotalStudyHours(req.user.id, timeframe);
    res.json({ totalStudyHours });
  } catch (error) {
    logger.error('Error getting total study hours:', error);
    res.status(500).json({ error: 'Failed to get total study hours' });
  }
});

/**
 * @route GET /api/wellbeing/summary
 * @desc Get wellbeing summary for the current user
 * @access Private
 */
router.get('/summary', authenticateJWT, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const timeframe = req.query.timeframe as string;
    const summary = await wellbeingService.getWellbeingSummary(req.user.id, timeframe);
    res.json(summary);
  } catch (error) {
    logger.error('Error getting wellbeing summary:', error);
    res.status(500).json({ error: 'Failed to get wellbeing summary' });
  }
});

export default router; 