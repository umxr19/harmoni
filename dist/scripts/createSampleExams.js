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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const exam_1 = __importDefault(require("../models/exam"));
const question_1 = __importDefault(require("../models/question"));
const userModel_1 = require("../models/userModel");
const logger_1 = __importDefault(require("../utils/logger"));
dotenv_1.default.config();
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/question-bank')
    .then(() => logger_1.default.info('Connected to MongoDB'))
    .catch(err => logger_1.default.error('MongoDB connection error:', err));
const createSampleExams = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find an admin user to be the creator
        const adminUser = yield userModel_1.User.findOne({ role: 'admin' });
        if (!adminUser) {
            logger_1.default.info('No admin user found. Please create an admin user first.');
            mongoose_1.default.disconnect();
            return;
        }
        // Get questions by category
        const verbalQuestions = yield question_1.default.find({ category: "Verbal Reasoning" }).limit(10);
        const nonVerbalQuestions = yield question_1.default.find({ category: "Non-Verbal Reasoning" }).limit(5);
        const mathQuestions = yield question_1.default.find({ category: "Mathematics" }).limit(10);
        const englishQuestions = yield question_1.default.find({ category: "English" }).limit(5);
        // Check if we have enough questions
        if (verbalQuestions.length < 5 || nonVerbalQuestions.length < 3 ||
            mathQuestions.length < 5 || englishQuestions.length < 3) {
            // If we don't have enough questions, let's create some basic ones
            logger_1.default.info('Not enough questions found. Creating basic questions...');
            // Create basic math questions
            const basicMathQuestions = [];
            for (let i = 1; i <= 10; i++) {
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                const sum = a + b;
                const question = new question_1.default({
                    question: `What is ${a} + ${b}?`,
                    options: [
                        { text: `${sum - 2}`, isCorrect: false },
                        { text: `${sum}`, isCorrect: true },
                        { text: `${sum + 2}`, isCorrect: false },
                        { text: `${sum + 4}`, isCorrect: false }
                    ],
                    explanation: `${a} + ${b} = ${sum}`,
                    category: ["Mathematics"],
                    subCategory: "Arithmetic",
                    difficulty: "easy",
                    estimatedTime: 20
                });
                yield question.save();
                basicMathQuestions.push(question);
            }
            // Create basic English questions
            const basicEnglishQuestions = [];
            for (let i = 1; i <= 5; i++) {
                const question = new question_1.default({
                    question: `Which word is spelled correctly?`,
                    options: [
                        { text: `Accomodate`, isCorrect: false },
                        { text: `Accommodate`, isCorrect: true },
                        { text: `Acommodate`, isCorrect: false },
                        { text: `Acomodate`, isCorrect: false }
                    ],
                    explanation: `The correct spelling is "Accommodate" with two 'c's and two 'm's.`,
                    category: ["English"],
                    subCategory: "Spelling",
                    difficulty: "medium",
                    estimatedTime: 25
                });
                yield question.save();
                basicEnglishQuestions.push(question);
            }
            // Use these questions for our exams
            const mathExam = new exam_1.default({
                title: 'Basic Math Practice',
                description: 'A simple exam with basic math questions.',
                duration: 15,
                questions: basicMathQuestions.map(q => q._id),
                category: ['Mathematics', 'Practice'],
                difficulty: 'easy',
                createdBy: adminUser._id,
                isPublic: true
            });
            const englishExam = new exam_1.default({
                title: 'English Spelling Practice',
                description: 'Practice your spelling skills with this short exam.',
                duration: 10,
                questions: basicEnglishQuestions.map(q => q._id),
                category: ['English', 'Spelling'],
                difficulty: 'medium',
                createdBy: adminUser._id,
                isPublic: true
            });
            yield mathExam.save();
            yield englishExam.save();
            logger_1.default.info('Created 2 sample exams with basic questions.');
        }
        else {
            // Create exams with the existing questions
            const verbalExam = new exam_1.default({
                title: 'Verbal Reasoning Practice',
                description: 'A focused exam to practice verbal reasoning skills for the 11+ exam.',
                duration: 20,
                questions: verbalQuestions.map(q => q._id),
                category: ['Verbal Reasoning', '11+ Preparation'],
                difficulty: 'medium',
                createdBy: adminUser._id,
                isPublic: true
            });
            const mathExam = new exam_1.default({
                title: 'Mathematics Practice',
                description: 'Sharpen your math skills with this 11+ focused practice exam.',
                duration: 25,
                questions: mathQuestions.map(q => q._id),
                category: ['Mathematics', '11+ Preparation'],
                difficulty: 'medium',
                createdBy: adminUser._id,
                isPublic: true
            });
            const fullExam = new exam_1.default({
                title: 'Complete 11+ Practice Exam',
                description: 'A comprehensive exam covering all sections of the 11+ test.',
                duration: 45,
                questions: [
                    ...verbalQuestions.slice(0, 5),
                    ...nonVerbalQuestions.slice(0, 3),
                    ...mathQuestions.slice(0, 5),
                    ...englishQuestions.slice(0, 3)
                ].map(q => q._id),
                category: ['11+ Preparation', 'Full Test'],
                difficulty: 'hard',
                createdBy: adminUser._id,
                isPublic: true
            });
            yield Promise.all([
                verbalExam.save(),
                mathExam.save(),
                fullExam.save()
            ]);
            logger_1.default.info('Created 3 sample exams successfully.');
        }
        mongoose_1.default.disconnect();
    }
    catch (error) {
        logger_1.default.error('Error creating sample exams:', error);
        mongoose_1.default.disconnect();
    }
});
createSampleExams();
