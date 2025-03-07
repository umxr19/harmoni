"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const classroomController_1 = require("../controllers/classroomController");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.protect);
// Teacher routes
router.post('/', (0, authMiddleware_1.authorizeRoles)('teacher'), classroomController_1.createClassroom);
router.get('/teacher', (0, authMiddleware_1.authorizeRoles)('teacher'), classroomController_1.getClassrooms);
router.get('/:id', (0, authMiddleware_1.authorizeRoles)('teacher'), classroomController_1.getClassroomById);
router.put('/:id', (0, authMiddleware_1.authorizeRoles)('teacher'), classroomController_1.updateClassroom);
router.delete('/:id', (0, authMiddleware_1.authorizeRoles)('teacher'), classroomController_1.deleteClassroom);
// Student management routes
router.post('/:id/students', (0, authMiddleware_1.authorizeRoles)('teacher'), classroomController_1.addStudent);
router.delete('/:id/students/:studentId', (0, authMiddleware_1.authorizeRoles)('teacher'), classroomController_1.removeStudent);
// Student routes
router.get('/student', (0, authMiddleware_1.authorizeRoles)('student'), classroomController_1.getStudentClassrooms);
exports.default = router;
