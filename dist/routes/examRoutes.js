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
const examService_1 = __importDefault(require("../services/examService"));
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
const examService = new examService_1.default();
// Add this at the very top of your routes
router.get('/', (req, res) => {
    res.json({ message: 'Exam routes are working!' });
});
// Get all public exams
router.get('/public', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const exams = yield examService.getPublicExams();
        res.json(exams);
    }
    catch (error) {
        logger_1.default.error('Error fetching public exams:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
}));
// Get exams created by a teacher
router.get('/teacher', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('teacher', 'admin'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const exams = yield examService.getTeacherExams(req.user.id);
        res.json(exams);
    }
    catch (error) {
        logger_1.default.error('Error fetching teacher exams:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
}));
// Get a specific exam
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const exam = yield examService.getExam(req.params.id);
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        res.json(exam);
    }
    catch (error) {
        logger_1.default.error('Error fetching exam:', error);
        res.status(500).json({ error: 'Failed to fetch exam' });
    }
}));
// Create a new exam
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('teacher', 'admin'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const exam = yield examService.createExam(Object.assign(Object.assign({}, req.body), { createdBy: req.user.id }));
        res.status(201).json(exam);
    }
    catch (error) {
        logger_1.default.error('Error creating exam:', error);
        res.status(500).json({ error: 'Failed to create exam' });
    }
}));
// Start an exam attempt
router.post('/:id/start', authMiddleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const attempt = yield examService.startExam(req.params.id, req.user.id);
        res.status(201).json(attempt);
    }
    catch (error) {
        logger_1.default.error('Error starting exam:', error);
        res.status(500).json({ error: 'Failed to start exam' });
    }
}));
// Submit an exam attempt
router.post('/:id/submit', authMiddleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield examService.submitExam(req.body.attemptId, req.body.answers);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error submitting exam:', error);
        res.status(500).json({ error: 'Failed to submit exam' });
    }
}));
// Get exam results
router.get('/:id/results/:attemptId', authMiddleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield examService.getExamResults(req.params.attemptId);
        if (!results) {
            return res.status(404).json({ error: 'Exam results not found' });
        }
        res.json(results);
    }
    catch (error) {
        logger_1.default.error('Error fetching exam results:', error);
        res.status(500).json({ error: 'Failed to fetch exam results' });
    }
}));
// Create sample exams (for testing)
router.post('/create-samples', authMiddleware_1.protect, (0, authMiddleware_1.authorizeRoles)('teacher', 'admin'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const userId = req.user.id;
        const result = yield examService.createSampleExams(userId);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error creating sample exams:', error);
        res.status(500).json({ error: 'Failed to create sample exams' });
    }
}));
exports.default = router;
