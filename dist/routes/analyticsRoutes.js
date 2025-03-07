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
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const analyticsController_1 = require("../controllers/analyticsController");
const router = express_1.default.Router();
const analyticsController = new analyticsController_1.AnalyticsController();
// Protect all routes
router.use(authMiddleware_1.protect);
// Student analytics routes
router.get('/student/current', (0, authMiddleware_1.authorizeRoles)('student'), analyticsController.getStudentAnalytics);
router.get('/student/:userId', (0, authMiddleware_1.authorizeRoles)('teacher', 'admin'), analyticsController.getStudentAnalytics);
// Progress route with authorization check
router.get('/progress/:userId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Allow students to view their own progress or teachers to view any student's progress
    if (req.user.role === 'student' && req.params.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access forbidden' });
    }
    next();
}), analyticsController.getStudentProgress);
// Teacher analytics routes
router.get('/teacher', (0, authMiddleware_1.authorizeRoles)('teacher'), analyticsController.getTeacherAnalytics);
exports.default = router;
