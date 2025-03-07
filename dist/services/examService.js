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
const exam_1 = __importDefault(require("../models/exam"));
const question_1 = __importDefault(require("../models/question"));
const examAttempt_1 = __importDefault(require("../models/examAttempt"));
class ExamService {
    // Get all public exams
    getPublicExams() {
        return __awaiter(this, void 0, void 0, function* () {
            return exam_1.default.find({ isPublic: true })
                .populate('createdBy', 'username')
                .sort({ createdAt: -1 })
                .lean();
        });
    }
    // Get exams created by a teacher
    getTeacherExams(teacherId) {
        return __awaiter(this, void 0, void 0, function* () {
            return exam_1.default.find({ createdBy: teacherId })
                .sort({ createdAt: -1 })
                .lean();
        });
    }
    // Get a specific exam
    getExam(examId) {
        return __awaiter(this, void 0, void 0, function* () {
            return exam_1.default.findById(examId)
                .populate('questions')
                .populate('createdBy', 'username')
                .lean();
        });
    }
    // Create a new exam
    createExam(examData) {
        return __awaiter(this, void 0, void 0, function* () {
            const exam = new exam_1.default({
                title: examData.title,
                description: examData.description,
                duration: examData.duration,
                questions: examData.questions,
                category: examData.category,
                difficulty: examData.difficulty,
                isPublic: examData.isPublic || false,
                createdBy: examData.createdBy
            });
            yield exam.save();
            return exam;
        });
    }
    // Start an exam attempt
    startExam(examId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the exam
            const exam = yield exam_1.default.findById(examId).populate('questions');
            if (!exam) {
                throw new Error('Exam not found');
            }
            // Create a new attempt
            const attempt = new examAttempt_1.default({
                exam: examId,
                user: userId,
                startTime: new Date(),
                endTime: null,
                answers: [],
                score: 0,
                completed: false
            });
            yield attempt.save();
            // Return the attempt with questions
            return {
                attemptId: attempt._id,
                examTitle: exam.title,
                duration: exam.duration,
                questions: exam.questions.map((q) => ({
                    _id: q._id,
                    text: q.text,
                    options: q.options.map((o) => ({
                        _id: o._id,
                        text: o.text
                    }))
                }))
            };
        });
    }
    // Submit an exam attempt
    submitExam(attemptId, answers) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find the attempt
            const attempt = yield examAttempt_1.default.findById(attemptId);
            if (!attempt) {
                throw new Error('Attempt not found');
            }
            if (attempt.completed) {
                throw new Error('This exam has already been submitted');
            }
            // Get the exam with questions
            const exam = yield exam_1.default.findById(attempt.exam).populate('questions');
            if (!exam) {
                throw new Error('Exam not found');
            }
            // Calculate score
            let correctAnswers = 0;
            const processedAnswers = [];
            for (const answer of answers) {
                const question = exam.questions
                    .find((q) => q._id.toString() === answer.questionId);
                if (!question)
                    continue;
                const correctOption = question.options.find((o) => o.isCorrect);
                const isCorrect = !!(correctOption && answer.selectedOptionId === correctOption._id.toString());
                if (isCorrect) {
                    correctAnswers++;
                }
                processedAnswers.push({
                    question: answer.questionId,
                    selectedOption: answer.selectedOptionId,
                    isCorrect: isCorrect
                });
            }
            const score = (correctAnswers / exam.questions.length) * 100;
            // Update the attempt
            attempt.answers = processedAnswers;
            attempt.score = score;
            attempt.endTime = new Date();
            attempt.completed = true;
            yield attempt.save();
            return {
                attemptId,
                score,
                totalQuestions: exam.questions.length,
                correctAnswers
            };
        });
    }
    // Get exam results
    getExamResults(attemptId) {
        return __awaiter(this, void 0, void 0, function* () {
            const attempt = yield examAttempt_1.default.findById(attemptId)
                .populate({
                path: 'exam',
                populate: {
                    path: 'questions'
                }
            })
                .populate('user', 'username')
                .lean();
            if (!attempt) {
                throw new Error('Attempt not found');
            }
            if (!attempt.completed) {
                throw new Error('This exam has not been completed yet');
            }
            return {
                examId: attempt.exam._id,
                examTitle: attempt.exam.title,
                score: attempt.score,
                totalQuestions: attempt.exam.questions.length,
                percentageScore: attempt.score,
                timeTaken: attempt.endTime
                    ? Math.round((attempt.endTime.getTime() - attempt.startTime.getTime()) / 60000)
                    : 0,
                startTime: attempt.startTime,
                endTime: attempt.endTime,
                answers: attempt.answers
            };
        });
    }
    // Create sample exams (for testing)
    createSampleExams(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get some questions to use in the exams
            const mathQuestions = yield question_1.default.find({
                category: { $in: ['Mathematics', 'Arithmetic'] }
            }).limit(10);
            const englishQuestions = yield question_1.default.find({
                category: { $in: ['English', 'Grammar'] }
            }).limit(10);
            const scienceQuestions = yield question_1.default.find({
                category: { $in: ['Science', 'Physics', 'Chemistry'] }
            }).limit(10);
            // Create sample exams
            const exams = [
                {
                    title: 'Basic Math Test',
                    description: 'Test your basic math skills',
                    duration: 30, // minutes
                    questions: mathQuestions.map(q => q._id),
                    category: ['Mathematics'],
                    difficulty: 'easy',
                    isPublic: true,
                    createdBy: userId
                },
                {
                    title: 'English Grammar Test',
                    description: 'Test your grammar knowledge',
                    duration: 45,
                    questions: englishQuestions.map(q => q._id),
                    category: ['English'],
                    difficulty: 'medium',
                    isPublic: true,
                    createdBy: userId
                },
                {
                    title: 'Science Quiz',
                    description: 'Test your science knowledge',
                    duration: 60,
                    questions: scienceQuestions.map(q => q._id),
                    category: ['Science'],
                    difficulty: 'hard',
                    isPublic: false,
                    createdBy: userId
                }
            ];
            // Save the exams
            const createdExams = yield exam_1.default.insertMany(exams);
            return {
                message: 'Sample exams created successfully',
                count: createdExams.length,
                exams: createdExams.map(exam => ({
                    _id: exam._id,
                    title: exam.title
                }))
            };
        });
    }
}
exports.default = ExamService;
