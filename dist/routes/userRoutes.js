"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
const userController = new userController_1.UserController();
// All routes require authentication
router.use(authMiddleware_1.protect);
// User profile routes
router.get('/profile', userController_1.getUserProfile);
router.put('/profile', userController_1.updateUserProfile);
// Progress and analytics routes
router.get('/progress', userController.getProgress.bind(userController));
// Teacher routes
router.get('/students', userController.getTeacherStudents.bind(userController));
exports.default = router;
