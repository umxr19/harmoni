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
exports.UserController = exports.updateUserProfile = exports.getUserProfile = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userService_1 = __importDefault(require("../services/userService"));
const logger_1 = __importDefault(require("../utils/logger"));
// Create an instance of UserService
const userService = new userService_1.default();
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = yield userService.getUserProfile(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        logger_1.default.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getUserProfile = getUserProfile;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const updateData = req.body;
        const updatedUser = yield userService.updateUserProfile(userId, updateData);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    }
    catch (error) {
        logger_1.default.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateUserProfile = updateUserProfile;
class UserController {
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                const User = mongoose_1.default.model('User');
                const user = yield User.findById(userId).select('-password');
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                const Progress = mongoose_1.default.model('Progress');
                const stats = yield Progress.aggregate([
                    { $match: { userId: userId } },
                    {
                        $group: {
                            _id: null,
                            totalQuestions: { $sum: 1 },
                            correctAnswers: { $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] } },
                            averageScore: { $avg: '$score' }
                        }
                    }
                ]);
                const profile = Object.assign(Object.assign({}, user.toObject()), { stats: stats[0] || { totalQuestions: 0, correctAnswers: 0, averageScore: 0 } });
                res.json(profile);
            }
            catch (error) {
                logger_1.default.error('Error fetching user profile:', error);
                res.status(500).json({ message: 'Error fetching user profile' });
            }
        });
    }
    getProgress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                const Progress = mongoose_1.default.model('Progress');
                const progress = yield Progress.find({ userId: userId })
                    .sort({ createdAt: -1 })
                    .limit(10);
                res.json(progress);
            }
            catch (error) {
                logger_1.default.error('Error fetching user progress:', error);
                res.status(500).json({ message: 'Error fetching user progress' });
            }
        });
    }
    getTeacherStudents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                const User = mongoose_1.default.model('User');
                const students = yield User.find({
                    role: 'student',
                    'classrooms.teacherId': userId
                }).select('-password');
                res.json(students);
            }
            catch (error) {
                logger_1.default.error('Error fetching teacher students:', error);
                res.status(500).json({ message: 'Error fetching teacher students' });
            }
        });
    }
}
exports.UserController = UserController;
