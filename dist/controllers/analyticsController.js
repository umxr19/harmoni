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
exports.AnalyticsController = void 0;
const progressModel_1 = require("../models/progressModel");
const analyticsService_1 = __importDefault(require("../services/analyticsService"));
const logger_1 = __importDefault(require("../utils/logger"));
const analyticsService = new analyticsService_1.default();
class AnalyticsController {
    getStudentAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId || req.user.id;
                const analytics = yield analyticsService.getStudentAnalytics(userId);
                res.json(analytics);
            }
            catch (error) {
                logger_1.default.error('Error fetching student analytics:', error);
                res.status(500).json({ message: 'Error fetching student analytics' });
            }
        });
    }
    getTeacherAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const analytics = yield analyticsService.getTeacherAnalytics(req.user.id);
                res.json(analytics);
            }
            catch (error) {
                logger_1.default.error('Error fetching teacher analytics:', error);
                res.status(500).json({ message: 'Error fetching teacher analytics' });
            }
        });
    }
    getStudentProgress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId || req.user.id;
                const progress = yield progressModel_1.Progress.find({ userId })
                    .populate('questionId', 'title content type options difficulty category')
                    .sort({ createdAt: -1 })
                    .limit(50);
                res.json(progress);
            }
            catch (error) {
                logger_1.default.error('Error fetching student progress:', error);
                res.status(500).json({ message: 'Error fetching student progress' });
            }
        });
    }
}
exports.AnalyticsController = AnalyticsController;
