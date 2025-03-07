import express, { Request, Response } from 'express';
import { protect } from '../middleware/authMiddleware';
import { wellbeingController } from '../controllers/wellbeingController';
import logger from '../utils/logger';

const router = express.Router();

// Protect all routes
router.use(protect);

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
router.post('/mood-ratings', wellbeingController.addMoodRating);

/**
 * @route GET /api/wellbeing/mood-ratings
 * @desc Get mood ratings for the current user
 * @access Private
 */
router.get('/mood-ratings', wellbeingController.getMoodRatings);

/**
 * @route GET /api/wellbeing/mood-ratings/average
 * @desc Get average mood rating for the current user
 * @access Private
 */
router.get('/mood-ratings/average', wellbeingController.getAverageMood);

/**
 * @route POST /api/wellbeing/journal
 * @desc Save a new journal entry
 * @access Private
 */
router.post('/journal', wellbeingController.addJournalEntry);

/**
 * @route GET /api/wellbeing/journal
 * @desc Get journal entries for the current user
 * @access Private
 */
router.get('/journal', wellbeingController.getJournalEntries);

/**
 * @route DELETE /api/wellbeing/journal/:id
 * @desc Delete a journal entry
 * @access Private
 */
router.delete('/journal/:id', wellbeingController.deleteJournalEntry);

/**
 * @route GET /api/wellbeing/study-hours
 * @desc Get total study hours for the current user
 * @access Private
 */
router.get('/study-hours', wellbeingController.getStudyHours);

/**
 * @route GET /api/wellbeing/summary
 * @desc Get wellbeing summary for the current user
 * @access Private
 */
router.get('/summary', wellbeingController.getWellbeingSummary);

export default router; 