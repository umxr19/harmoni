"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const wellbeingController_1 = require("../controllers/wellbeingController");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
// Protect all routes
router.use(authMiddleware_1.protect);
// Middleware to log requests
router.use((req, res, next) => {
    logger_1.default.info(`Wellbeing route requested: ${req.method} ${req.path}`);
    next();
});
/**
 * @route POST /api/wellbeing/mood-ratings
 * @desc Save a new mood rating
 * @access Private
 */
router.post('/mood-ratings', wellbeingController_1.wellbeingController.addMoodRating);
/**
 * @route GET /api/wellbeing/mood-ratings
 * @desc Get mood ratings for the current user
 * @access Private
 */
router.get('/mood-ratings', wellbeingController_1.wellbeingController.getMoodRatings);
/**
 * @route GET /api/wellbeing/mood-ratings/average
 * @desc Get average mood rating for the current user
 * @access Private
 */
router.get('/mood-ratings/average', wellbeingController_1.wellbeingController.getAverageMood);
/**
 * @route POST /api/wellbeing/journal
 * @desc Save a new journal entry
 * @access Private
 */
router.post('/journal', wellbeingController_1.wellbeingController.addJournalEntry);
/**
 * @route GET /api/wellbeing/journal
 * @desc Get journal entries for the current user
 * @access Private
 */
router.get('/journal', wellbeingController_1.wellbeingController.getJournalEntries);
/**
 * @route DELETE /api/wellbeing/journal/:id
 * @desc Delete a journal entry
 * @access Private
 */
router.delete('/journal/:id', wellbeingController_1.wellbeingController.deleteJournalEntry);
/**
 * @route GET /api/wellbeing/study-hours
 * @desc Get total study hours for the current user
 * @access Private
 */
router.get('/study-hours', wellbeingController_1.wellbeingController.getStudyHours);
/**
 * @route GET /api/wellbeing/summary
 * @desc Get wellbeing summary for the current user
 * @access Private
 */
router.get('/summary', wellbeingController_1.wellbeingController.getWellbeingSummary);
exports.default = router;
