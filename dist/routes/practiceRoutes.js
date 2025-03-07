"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const practiceController_1 = require("../controllers/practiceController");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.protect);
// Practice sets routes - must come before parameterized routes
router.get('/sets', practiceController_1.getAllPracticeSets);
router.get('/sets/:id', practiceController_1.getPracticeSet);
// History route - must come before parameterized routes
router.get('/history', practiceController_1.getPracticeHistory);
// Practice session routes
router.post('/start', practiceController_1.startPractice);
router.post('/:sessionId/answer', practiceController_1.submitAnswer);
router.get('/:sessionId', practiceController_1.getPracticeSession);
exports.default = router;
