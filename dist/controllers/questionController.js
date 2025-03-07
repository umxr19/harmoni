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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestion = exports.updateQuestion = exports.getQuestionById = exports.getQuestions = exports.createQuestion = void 0;
const questionModel_1 = require("../models/questionModel");
const createQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const question = new questionModel_1.Question(Object.assign(Object.assign({}, req.body), { createdBy: req.user.id }));
        yield question.save();
        res.status(201).json(question);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating question' });
    }
});
exports.createQuestion = createQuestion;
const getQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, difficulty, type } = req.query;
        const query = {};
        if (category)
            query.category = category;
        if (difficulty)
            query.difficulty = difficulty;
        if (type)
            query.type = type;
        const questions = yield questionModel_1.Question.find(query)
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.json(questions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching questions' });
    }
});
exports.getQuestions = getQuestions;
const getQuestionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const question = yield questionModel_1.Question.findById(req.params.id)
            .populate('createdBy', 'username');
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json(question);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching question' });
    }
});
exports.getQuestionById = getQuestionById;
const updateQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const question = yield questionModel_1.Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        // Check if user is the creator or an admin
        if (question.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this question' });
        }
        Object.assign(question, req.body);
        yield question.save();
        res.json(question);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating question' });
    }
});
exports.updateQuestion = updateQuestion;
const deleteQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const question = yield questionModel_1.Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        // Check if user is the creator or an admin
        if (question.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this question' });
        }
        yield questionModel_1.Question.deleteOne({ _id: req.params.id });
        res.json({ message: 'Question deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting question' });
    }
});
exports.deleteQuestion = deleteQuestion;
