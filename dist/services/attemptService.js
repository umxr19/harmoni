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
const question_1 = __importDefault(require("../models/question"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
class AttemptService {
    submitAttempt(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the question to check if answer is correct
            const question = yield question_1.default.findById(data.questionId);
            if (!question) {
                throw new Error('Question not found');
            }
            // Check if the selected option is correct
            const correctOption = question.options.find((opt) => opt.isCorrect);
            const isCorrect = (correctOption === null || correctOption === void 0 ? void 0 : correctOption.text) === data.selectedOption;
            // Create the attempt
            const attempt = new attempt_1.default({
                user: data.userId,
                question: data.questionId,
                selectedOption: data.selectedOption,
                isCorrect,
                timeSpent: data.timeSpent
            });
            yield attempt.save();
            return attempt;
        });
    }
    getUserStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Basic stats
            const attempts = yield attempt_1.default.find({ user: userId });
            const correctAttempts = attempts.filter(a => a.isCorrect);
            // Get category-specific stats
            const categoryStats = yield this.getUserCategoryStats(userId);
            // Get recent activity
            const recentActivity = yield this.getUserRecentActivity(userId);
            return {
                totalAttempts: attempts.length,
                correctAnswers: correctAttempts.length,
                accuracy: attempts.length > 0 ? (correctAttempts.length / attempts.length) * 100 : 0,
                averageTime: attempts.length > 0 ?
                    attempts.reduce((acc, curr) => acc + curr.timeSpent, 0) / attempts.length : 0,
                categoryStats,
                recentActivity
            };
        });
    }
    getUserCategoryStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const categoryStats = yield attempt_1.default.aggregate([
                { $match: { user: new mongoose_1.default.Types.ObjectId(userId) } },
                {
                    $lookup: {
                        from: 'questions',
                        localField: 'question',
                        foreignField: '_id',
                        as: 'questionData'
                    }
                },
                { $unwind: '$questionData' },
                { $unwind: '$questionData.category' },
                {
                    $group: {
                        _id: '$questionData.category',
                        totalAttempts: { $sum: 1 },
                        correctAttempts: {
                            $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] }
                        }
                    }
                },
                {
                    $project: {
                        category: '$_id',
                        totalAttempts: 1,
                        correctAttempts: 1,
                        accuracy: {
                            $multiply: [
                                { $divide: ['$correctAttempts', '$totalAttempts'] },
                                100
                            ]
                        }
                    }
                },
                { $sort: { category: 1 } }
            ]);
            return categoryStats;
        });
    }
    getUserRecentActivity(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 10) {
            const recentAttempts = yield attempt_1.default.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('question', 'title content');
            return recentAttempts.map(attempt => {
                // Use type assertion to tell TypeScript that question is populated
                const question = attempt.question;
                return {
                    date: attempt.createdAt,
                    questionId: question._id,
                    questionTitle: question.title,
                    action: `Answered "${question.title}"`,
                    result: attempt.isCorrect ? 'Correct' : 'Incorrect',
                    selectedOption: attempt.selectedOption,
                    timeSpent: attempt.timeSpent
                };
            });
        });
    }
    getRecommendedQuestions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find categories where user has lower accuracy
            const categoryStats = yield this.getUserCategoryStats(userId);
            // Sort by lowest accuracy
            const weakestCategories = [...categoryStats].sort((a, b) => a.accuracy - b.accuracy);
            // Get top 2 weakest categories
            const categoriesToImprove = weakestCategories
                .slice(0, 2)
                .map(cat => cat.category);
            // Find questions in those categories that the user hasn't attempted yet
            const attemptedQuestionIds = (yield attempt_1.default.find({ user: userId }))
                .map(attempt => attempt.question.toString());
            const recommendedQuestions = yield question_1.default.find({
                category: { $in: categoriesToImprove },
                _id: { $nin: attemptedQuestionIds }
            })
                .limit(5)
                .select('_id title content category difficulty');
            return {
                weakCategories: categoriesToImprove,
                recommendedQuestions
            };
        });
    }
    getQuestionStats(questionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const attempts = yield attempt_1.default.find({ question: questionId });
            return {
                totalAttempts: attempts.length,
                correctAnswers: attempts.filter(a => a.isCorrect).length,
                averageTime: attempts.reduce((acc, curr) => acc + curr.timeSpent, 0) / attempts.length || 0,
                accuracy: (attempts.filter(a => a.isCorrect).length / attempts.length) * 100 || 0
            };
        });
    }
    getLeaderboard(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { timeframe = 'all-time', category, limit = 10 } = options;
                // Build date filter
                const dateFilter = {};
                if (timeframe !== 'all-time') {
                    const now = new Date();
                    switch (timeframe) {
                        case 'daily':
                            now.setHours(0, 0, 0, 0);
                            dateFilter.createdAt = { $gte: now };
                            break;
                        case 'weekly':
                            now.setDate(now.getDate() - 7);
                            dateFilter.createdAt = { $gte: now };
                            break;
                        case 'monthly':
                            now.setMonth(now.getMonth() - 1);
                            dateFilter.createdAt = { $gte: now };
                            break;
                    }
                }
                // Build category filter
                const categoryFilter = category ? {
                    'question.category': category
                } : {};
                const leaderboard = yield attempt_1.default.aggregate([
                    {
                        $match: Object.assign(Object.assign({}, dateFilter), categoryFilter)
                    },
                    {
                        $lookup: {
                            from: 'questions',
                            localField: 'question',
                            foreignField: '_id',
                            as: 'question'
                        }
                    },
                    {
                        $unwind: '$question'
                    },
                    {
                        $group: {
                            _id: '$user',
                            totalAttempts: { $sum: 1 },
                            correctAnswers: {
                                $sum: { $cond: ['$isCorrect', 1, 0] }
                            },
                            averageTime: { $avg: '$timeSpent' },
                            score: {
                                $sum: {
                                    $cond: [
                                        '$isCorrect',
                                        {
                                            $multiply: [
                                                10,
                                                {
                                                    $switch: {
                                                        branches: [
                                                            { case: { $eq: ['$question.difficulty', 'easy'] }, then: 1 },
                                                            { case: { $eq: ['$question.difficulty', 'medium'] }, then: 2 },
                                                            { case: { $eq: ['$question.difficulty', 'hard'] }, then: 3 }
                                                        ],
                                                        default: 1
                                                    }
                                                }
                                            ]
                                        },
                                        0
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $unwind: '$user'
                    },
                    {
                        $project: {
                            username: '$user.username',
                            totalAttempts: 1,
                            correctAnswers: 1,
                            accuracy: {
                                $multiply: [
                                    { $divide: ['$correctAnswers', '$totalAttempts'] },
                                    100
                                ]
                            },
                            averageTime: 1,
                            score: 1
                        }
                    },
                    {
                        $sort: { score: -1 }
                    },
                    {
                        $limit: limit
                    }
                ]);
                return leaderboard;
            }
            catch (error) {
                logger_1.default.error('Leaderboard error:', error);
                throw error;
            }
        });
    }
}
exports.default = AttemptService;
