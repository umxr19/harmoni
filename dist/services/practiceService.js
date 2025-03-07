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
const question_1 = __importDefault(require("../models/question"));
const practiceSet_1 = __importDefault(require("../models/practiceSet"));
const attempt_1 = __importDefault(require("../models/attempt"));
const mongoose_1 = __importDefault(require("mongoose"));
class PracticeService {
    // Get a practice set by ID
    getPracticeSet(setId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // If setId is 'random', create a random set of questions
            if (setId === 'random') {
                return this.getRandomQuestions(10); // 10 random questions
            }
            // Otherwise, get the specified practice set
            const practiceSet = yield practiceSet_1.default.findById(setId);
            if (!practiceSet) {
                throw new Error('Practice set not found');
            }
            // Check if private set is accessible by this user
            if (!practiceSet.isPublic && (!userId || practiceSet.createdBy.toString() !== userId)) {
                throw new Error('You do not have access to this practice set');
            }
            // Get all questions in the set
            const questions = yield question_1.default.find({
                _id: { $in: practiceSet.questions }
            });
            return questions;
        });
    }
    // Get random questions for practice
    getRandomQuestions(count, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {};
            if (filters === null || filters === void 0 ? void 0 : filters.category) {
                query.category = { $in: filters.category };
            }
            if (filters === null || filters === void 0 ? void 0 : filters.difficulty) {
                query.difficulty = filters.difficulty;
            }
            // Get random questions
            const questions = yield question_1.default.aggregate([
                { $match: query },
                { $sample: { size: count } }
            ]);
            return questions;
        });
    }
    // Create a new practice set
    createPracticeSet(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate that all questions exist
            const questionCount = yield question_1.default.countDocuments({
                _id: { $in: data.questions.map(id => new mongoose_1.default.Types.ObjectId(id)) }
            });
            if (questionCount !== data.questions.length) {
                throw new Error('One or more questions do not exist');
            }
            const practiceSet = new practiceSet_1.default({
                name: data.name,
                description: data.description,
                questions: data.questions,
                category: data.category,
                difficulty: data.difficulty,
                createdBy: data.createdBy,
                isPublic: data.isPublic
            });
            yield practiceSet.save();
            return practiceSet;
        });
    }
    // Get practice results for a user
    getPracticeResults(setId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the practice set
            const practiceSet = yield practiceSet_1.default.findById(setId);
            if (!practiceSet) {
                throw new Error('Practice set not found');
            }
            // Get all attempts for this user on questions in this set
            const attempts = yield attempt_1.default.find({
                user: userId,
                question: { $in: practiceSet.questions }
            }).populate('question', 'category');
            // Calculate overall stats
            const totalQuestions = practiceSet.questions.length;
            const correctAnswers = attempts.filter(a => a.isCorrect).length;
            const accuracy = (correctAnswers / totalQuestions) * 100;
            const averageTime = attempts.reduce((acc, curr) => acc + curr.timeSpent, 0) / attempts.length || 0;
            // Calculate category performance
            const categoryMap = new Map();
            attempts.forEach(attempt => {
                const question = attempt.question; // Type assertion for populated field
                question.category.forEach((cat) => {
                    if (!categoryMap.has(cat)) {
                        categoryMap.set(cat, { correct: 0, total: 0 });
                    }
                    const stats = categoryMap.get(cat);
                    stats.total += 1;
                    if (attempt.isCorrect) {
                        stats.correct += 1;
                    }
                });
            });
            const categoryPerformance = Array.from(categoryMap.entries()).map(([category, stats]) => ({
                category,
                accuracy: (stats.correct / stats.total) * 100
            }));
            return {
                totalQuestions,
                correctAnswers,
                accuracy,
                averageTime,
                categoryPerformance
            };
        });
    }
    // Get all public practice sets
    getAllPracticeSets(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { isPublic: true };
            // If userId is provided, also include private sets created by this user
            if (userId) {
                query.$or = [
                    { isPublic: true },
                    { createdBy: userId }
                ];
            }
            const practiceSets = yield practiceSet_1.default.find(query)
                .populate('createdBy', 'username')
                .sort({ createdAt: -1 });
            return practiceSets;
        });
    }
    // Add this method to your PracticeService class
    createSamplePracticeSets(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if we already have practice sets
            const existingSets = yield practiceSet_1.default.find();
            if (existingSets.length > 0) {
                return { message: 'Sample practice sets already exist' };
            }
            // Get all questions
            const allQuestions = yield question_1.default.find();
            if (allQuestions.length === 0) {
                throw new Error('No questions available to create practice sets');
            }
            // Create categories based on existing questions
            const categories = [...new Set(allQuestions.flatMap(q => q.category))];
            // Create a general practice set with all questions
            const generalSet = new practiceSet_1.default({
                name: '11+ General Practice',
                description: 'A comprehensive set of questions covering various topics for 11+ exam preparation.',
                questions: allQuestions.map(q => q._id),
                category: categories,
                difficulty: 'medium',
                createdBy: userId,
                isPublic: true
            });
            yield generalSet.save();
            // Create difficulty-based sets if we have enough questions
            if (allQuestions.length >= 3) {
                const easyQuestions = allQuestions
                    .filter(q => q.difficulty === 'easy')
                    .map(q => q._id);
                const mediumQuestions = allQuestions
                    .filter(q => q.difficulty === 'medium')
                    .map(q => q._id);
                const hardQuestions = allQuestions
                    .filter(q => q.difficulty === 'hard')
                    .map(q => q._id);
                if (easyQuestions.length > 0) {
                    const easySet = new practiceSet_1.default({
                        name: 'Beginner Practice',
                        description: 'Start your preparation with these easier questions to build confidence.',
                        questions: easyQuestions,
                        category: categories,
                        difficulty: 'easy',
                        createdBy: userId,
                        isPublic: true
                    });
                    yield easySet.save();
                }
                if (hardQuestions.length > 0) {
                    const hardSet = new practiceSet_1.default({
                        name: 'Advanced Practice',
                        description: 'Challenge yourself with these difficult questions to master the 11+ exam.',
                        questions: hardQuestions,
                        category: categories,
                        difficulty: 'hard',
                        createdBy: userId,
                        isPublic: true
                    });
                    yield hardSet.save();
                }
            }
            return { message: 'Sample practice sets created successfully' };
        });
    }
}
exports.default = PracticeService;
