"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const progressService_1 = __importDefault(require("../services/progressService"));
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
const progressService = new progressService_1.default();
// Record a new attempt
router.post('/attempts', authMiddleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { questionId, selectedOption, isCorrect, timeSpent } = req.body;
        const userId = req.user.id;
        const attempt = yield progressService.recordAttempt({
            userId,
            questionId,
            selectedOption,
            isCorrect,
            timeSpent
        });
        res.status(201).json(attempt);
    }
    catch (error) {
        logger_1.default.error('Error recording attempt:', error);
        res.status(500).json({ error: 'Failed to record attempt' });
    }
}));
// Get user progress stats
router.get('/stats', authMiddleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const userId = req.user.id;
        const stats = yield progressService.getUserProgress(userId);
        res.json(stats);
    }
    catch (error) {
        logger_1.default.error('Error fetching progress stats:', error);
        res.status(500).json({ error: 'Failed to fetch progress stats' });
    }
}));
// Get personalized recommendations
router.get('/recommendations', authMiddleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const userId = req.user.id;
        const recommendations = yield getSimpleRecommendations(userId);
        res.json(recommendations);
    }
    catch (error) {
        logger_1.default.error('Error generating recommendations:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
}));
// Helper function for recommendations
function getSimpleRecommendations(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            recommendedTopics: ['Algebra', 'Grammar', 'Reading Comprehension'],
            recommendedQuestions: [],
            message: 'Based on your recent activity, we recommend focusing on these areas.'
        };
    });
}
// Get user progress
router.get('/', authMiddleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const progress = yield progressService.getUserProgress(req.user.id);
        res.json(progress);
    }
    catch (error) {
        logger_1.default.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
}));
// Get progress for a specific category
router.get('/category/:category', authMiddleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const progress = yield progressService.getCategoryProgress(req.user.id, req.params.category);
        res.json(progress);
    }
    catch (error) {
        logger_1.default.error('Error fetching category progress:', error);
        res.status(500).json({ error: 'Failed to fetch category progress' });
    }
}));
// Get children for a parent user
router.get('/children', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('parent'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const children = yield progressService.getParentChildren(req.user.id);
        res.json(children);
    }
    catch (error) {
        logger_1.default.error('Error fetching children:', error);
        res.status(500).json({ error: 'Failed to fetch children' });
    }
}));
// Get a child's recent activity
router.get('/child/:childId/activity', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('parent'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activity = yield progressService.getChildRecentActivity(req.params.childId);
        res.json(activity);
    }
    catch (error) {
        logger_1.default.error('Error fetching child activity:', error);
        res.status(500).json({ error: 'Failed to fetch child activity' });
    }
}));
exports.default = router;
