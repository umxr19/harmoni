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
exports.getAllPracticeSets = exports.getPracticeSet = exports.getPracticeHistory = exports.getPracticeSession = exports.submitAnswer = exports.startPractice = void 0;
const questionModel_1 = require("../models/questionModel");
const progressModel_1 = require("../models/progressModel");
const practiceService_1 = __importDefault(require("../services/practiceService"));
const practiceService = new practiceService_1.default();
const startPractice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, difficulty, type } = req.body;
        const query = {};
        if (category)
            query.category = category;
        if (difficulty)
            query.difficulty = difficulty;
        if (type)
            query.type = type;
        const questions = yield questionModel_1.Question.find(query)
            .select('-correctAnswer -explanation')
            .limit(10);
        res.json({
            sessionId: Date.now().toString(),
            questions
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error starting practice session' });
    }
});
exports.startPractice = startPractice;
const submitAnswer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { questionId, answer, timeSpent } = req.body;
        const question = yield questionModel_1.Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        const isCorrect = answer === question.correctAnswer;
        const score = isCorrect ? 100 : 0;
        const progress = new progressModel_1.Progress({
            userId: req.user.id,
            questionId,
            answer,
            isCorrect,
            score,
            timeSpent
        });
        yield progress.save();
        res.json({
            isCorrect,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error submitting answer' });
    }
});
exports.submitAnswer = submitAnswer;
const getPracticeSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const progress = yield progressModel_1.Progress.find({
            userId: req.user.id,
            createdAt: {
                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
        })
            .populate('questionId', 'title content type options difficulty category')
            .sort({ createdAt: -1 });
        res.json(progress);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching practice session' });
    }
});
exports.getPracticeSession = getPracticeSession;
const getPracticeHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const history = yield progressModel_1.Progress.aggregate([
            { $match: { userId: req.user.id } },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        category: '$questionId.category'
                    },
                    totalQuestions: { $sum: 1 },
                    correctAnswers: { $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] } },
                    averageScore: { $avg: '$score' },
                    averageTimeSpent: { $avg: '$timeSpent' }
                }
            },
            { $sort: { '_id.date': -1 } }
        ]);
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching practice history' });
    }
});
exports.getPracticeHistory = getPracticeHistory;
// Get a specific practice set by ID
const getPracticeSet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const questions = yield practiceService.getPracticeSet(id, userId);
        res.json(questions);
    }
    catch (error) {
        res.status(404).json({
            message: error.message || 'Error fetching practice set'
        });
    }
});
exports.getPracticeSet = getPracticeSet;
// Get all practice sets
const getAllPracticeSets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const practiceSets = yield practiceService.getAllPracticeSets(userId);
        res.json(practiceSets);
    }
    catch (error) {
        res.status(500).json({
            message: error.message || 'Error fetching practice sets'
        });
    }
});
exports.getAllPracticeSets = getAllPracticeSets;
