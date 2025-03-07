"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const questionController_1 = require("../controllers/questionController");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.protect);
// Question management routes
router.post('/', (0, authMiddleware_1.authorizeRoles)('teacher', 'admin'), questionController_1.createQuestion);
router.get('/', questionController_1.getQuestions);
router.get('/:id', questionController_1.getQuestionById);
router.put('/:id', (0, authMiddleware_1.authorizeRoles)('teacher', 'admin'), questionController_1.updateQuestion);
router.delete('/:id', (0, authMiddleware_1.authorizeRoles)('teacher', 'admin'), questionController_1.deleteQuestion);
exports.default = router;
