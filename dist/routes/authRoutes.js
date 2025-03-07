"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// Public routes
router.post('/login', authController_1.login);
router.post('/register', authController_1.register);
// Protected routes
router.get('/me', authMiddleware_1.protect, authController_1.getCurrentUser);
exports.default = router;
