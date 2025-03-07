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
class QuestionService {
    constructor() {
        this.questions = [];
    }
    getAllQuestions() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.questions;
        });
    }
    addQuestion(question) {
        return __awaiter(this, void 0, void 0, function* () {
            this.questions.push(question);
            return question;
        });
    }
    searchQuestions(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {};
            if (filters.search) {
                query.$text = { $search: filters.search };
            }
            if (filters.category) {
                query.category = { $in: filters.category };
            }
            if (filters.difficulty) {
                query.difficulty = filters.difficulty;
            }
            return yield question_1.default.find(query)
                .skip((filters.page - 1) * filters.limit)
                .limit(filters.limit);
        });
    }
    getCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            const categories = yield question_1.default.distinct('category'); // Assuming 'category' is a field in your Question model
            return categories;
        });
    }
    getQuestions() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield question_1.default.find(); // Fetch all questions
        });
    }
    getQuestionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield question_1.default.findById(id); // Fetch question by ID
        });
    }
    updateQuestion(id, questionData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield question_1.default.findByIdAndUpdate(id, questionData, { new: true }); // Update question
        });
    }
    deleteQuestion(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield question_1.default.findByIdAndDelete(id); // Delete question
        });
    }
}
exports.default = QuestionService;
