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
const joi_1 = __importDefault(require("joi"));
const logger_1 = __importDefault(require("../utils/logger"));
const questionSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    content: joi_1.default.string().required(),
    options: joi_1.default.array().items(joi_1.default.object({
        text: joi_1.default.string().required(),
        isCorrect: joi_1.default.boolean().required()
    }))
        .min(2)
        .max(4)
        .custom((value, helpers) => {
        const correctAnswers = value.filter(option => option.isCorrect).length;
        if (correctAnswers !== 1) {
            return helpers.error('array.base', {
                message: 'Exactly one option must be correct'
            });
        }
        return value;
    })
        .required(),
    category: joi_1.default.array().items(joi_1.default.string()).min(1).required(),
    difficulty: joi_1.default.string().valid('easy', 'medium', 'hard').required(),
    imageUrl: joi_1.default.string().uri().optional()
});
class IndexController {
    constructor(questionService) {
        this.questionService = questionService;
    }
    getQuestions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const questions = yield this.questionService.getQuestions();
                res.json(questions);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to fetch questions' });
            }
        });
    }
    getQuestionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const question = yield this.questionService.getQuestionById(req.params.id);
                res.json(question);
            }
            catch (error) {
                res.status(404).json({ error: 'Question not found' });
            }
        });
    }
    addQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                logger_1.default.info('Adding question with user:', req.user);
                const { error, value } = questionSchema.validate(req.body);
                if (error) {
                    return res.status(400).json({ error: error.details[0].message });
                }
                // Add the createdBy field
                const questionData = Object.assign(Object.assign({}, value), { createdBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
                logger_1.default.info('Creating question with data:', questionData);
                const question = yield this.questionService.addQuestion(questionData);
                logger_1.default.info('Question created:', question);
                res.status(201).json(question);
            }
            catch (error) {
                logger_1.default.error('Error adding question:', error);
                res.status(400).json({ error: 'Invalid question data' });
            }
        });
    }
    updateQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const question = yield this.questionService.updateQuestion(req.params.id, req.body);
                res.json(question);
            }
            catch (error) {
                res.status(404).json({ error: 'Question not found' });
            }
        });
    }
    deleteQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.questionService.deleteQuestion(req.params.id);
                res.status(204).send();
            }
            catch (error) {
                res.status(404).json({ error: 'Question not found' });
            }
        });
    }
}
exports.default = IndexController;
