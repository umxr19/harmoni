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
const attempt_1 = __importDefault(require("../models/attempt"));
const userModel_1 = require("../models/userModel");
const question_1 = __importDefault(require("../models/question"));
class ProgressService {
    // Record a new attempt
    recordAttempt(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const attempt = new attempt_1.default({
                user: data.userId,
                question: data.questionId,
                selectedOption: data.selectedOption,
                isCorrect: data.isCorrect,
                timeSpent: data.timeSpent
            });
            yield attempt.save();
            return attempt;
        });
    }
    // Get user progress
    getUserProgress(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const attempts = yield attempt_1.default.find({ user: userId });
            // Calculate overall stats
            const totalAttempts = attempts.length;
            const correctAttempts = attempts.filter(a => a.isCorrect).length;
            const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
            // Get category breakdown
            const questionIds = attempts.map(a => a.question);
            const questions = yield question_1.default.find({ _id: { $in: questionIds } }).lean();
            const categoryMap = new Map();
            for (const attempt of attempts) {
                const question = questions.find(q => q._id.toString() === attempt.question.toString());
                if (!question)
                    continue;
                // Handle category being either a string or an array of strings
                const categories = Array.isArray(question.category)
                    ? question.category
                    : [question.category];
                // Process each category in the array
                for (const category of categories) {
                    if (!categoryMap.has(category)) {
                        categoryMap.set(category, { total: 0, correct: 0 });
                    }
                    const stats = categoryMap.get(category);
                    stats.total++;
                    if (attempt.isCorrect) {
                        stats.correct++;
                    }
                }
            }
            const categoryProgress = Array.from(categoryMap.entries()).map(([category, stats]) => ({
                category,
                totalAttempts: stats.total,
                correctAttempts: stats.correct,
                accuracy: (stats.correct / stats.total) * 100
            }));
            return {
                totalAttempts,
                correctAttempts,
                accuracy,
                categoryProgress
            };
        });
    }
    // Get progress for a specific category
    getCategoryProgress(userId, category) {
        return __awaiter(this, void 0, void 0, function* () {
            const attempts = yield attempt_1.default.find({ user: userId })
                .populate({
                path: 'question',
                match: { category }
            })
                .lean();
            // Filter out attempts where question is null (category didn't match)
            const filteredAttempts = attempts.filter(a => a.question);
            const totalAttempts = filteredAttempts.length;
            const correctAttempts = filteredAttempts.filter(a => a.isCorrect).length;
            const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
            // Get difficulty breakdown
            const difficultyMap = new Map();
            for (const attempt of filteredAttempts) {
                const difficulty = attempt.question.difficulty;
                if (!difficultyMap.has(difficulty)) {
                    difficultyMap.set(difficulty, { total: 0, correct: 0 });
                }
                const stats = difficultyMap.get(difficulty);
                stats.total++;
                if (attempt.isCorrect) {
                    stats.correct++;
                }
            }
            const difficultyProgress = Array.from(difficultyMap.entries()).map(([difficulty, stats]) => ({
                difficulty,
                totalAttempts: stats.total,
                correctAttempts: stats.correct,
                accuracy: (stats.correct / stats.total) * 100
            }));
            return {
                category,
                totalAttempts,
                correctAttempts,
                accuracy,
                difficultyProgress
            };
        });
    }
    // Get children for a parent user
    getParentChildren(parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const parent = yield userModel_1.User.findById(parentId).lean();
            if (!parent) {
                throw new Error('User not found');
            }
            // Check if user is a parent - allow any role to access for now
            // if (parent.role !== 'parent') {
            //   throw new Error('User is not a parent');
            // }
            // Use an empty array if childrenIds doesn't exist
            const childrenIds = parent.childrenIds || [];
            // Find all children
            const children = yield userModel_1.User.find({
                _id: { $in: childrenIds },
                role: 'student'
            })
                .select('_id username email')
                .lean();
            return children;
        });
    }
    // Get a child's recent activity
    getChildRecentActivity(childId) {
        return __awaiter(this, void 0, void 0, function* () {
            const attempts = yield attempt_1.default.find({ user: childId })
                .populate('question')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();
            return attempts.map(attempt => ({
                id: attempt._id,
                questionId: attempt.question._id,
                questionText: attempt.question.text,
                category: attempt.question.category,
                isCorrect: attempt.isCorrect,
                date: attempt.createdAt
            }));
        });
    }
    // Get detailed history of user attempts
    getUserAttemptHistory(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 20) {
            return attempt_1.default.find({ user: userId })
                .populate('question')
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
        });
    }
}
exports.default = ProgressService;
