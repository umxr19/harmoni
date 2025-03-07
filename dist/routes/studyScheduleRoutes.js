"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studyScheduleController_1 = require("../controllers/studyScheduleController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Protect all routes
router.use(authMiddleware_1.protect);
// Get weekly study schedule
router.get('/weekly', studyScheduleController_1.studyScheduleController.getWeeklySchedule);
// Invalidate cached schedule to force regeneration
router.post('/invalidate', studyScheduleController_1.studyScheduleController.invalidateSchedule);
exports.default = router;
