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
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = require("../models/userModel");
const assignment_1 = __importDefault(require("../models/assignment"));
const classroom_1 = __importDefault(require("../models/classroom"));
const attempt_1 = __importDefault(require("../models/attempt"));
const progressModel_1 = require("../models/progressModel");
const logger_1 = __importDefault(require("../utils/logger"));
class AnalyticsService {
    // Get analytics for a student
    getStudentAnalytics(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if the student exists
                const student = yield userModel_1.User.findById(studentId);
                if (!student) {
                    throw new Error('Student not found');
                }
                // Get classrooms the student is enrolled in
                const classrooms = yield classroom_1.default.find({ students: studentId })
                    .select('_id name')
                    .lean();
                const classroomIds = classrooms.map(c => c._id);
                // Get assignments for these classrooms
                const assignments = yield assignment_1.default.find({
                    classroomId: { $in: classroomIds }
                }).lean();
                // Get progress data
                const progress = yield progressModel_1.Progress.find({ userId: studentId }).lean();
                // Calculate statistics
                const totalQuestions = progress.length;
                const correctAnswers = progress.filter(p => p.isCorrect).length;
                const averageScore = totalQuestions > 0
                    ? (correctAnswers / totalQuestions) * 100
                    : 0;
                // Get recent activity
                const recentActivity = yield progressModel_1.Progress.find({ userId: studentId })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('isCorrect score timeSpent createdAt')
                    .lean();
                // Format activity for response
                const formattedActivity = recentActivity.map(activity => this.formatActivityData(activity));
                return {
                    stats: {
                        questionsAttempted: totalQuestions,
                        correctAnswers,
                        averageScore,
                        timeSpent: progress.reduce((acc, curr) => acc + curr.timeSpent, 0)
                    },
                    recentActivity: formattedActivity
                };
            }
            catch (error) {
                logger_1.default.error('Error in getStudentAnalytics:', error);
                throw error;
            }
        });
    }
    // Helper method to format activity data
    formatActivityData(activity) {
        return {
            timestamp: activity.createdAt,
            details: {
                score: activity.score,
                isCorrect: activity.isCorrect,
                timeSpent: activity.timeSpent
            }
        };
    }
    // Helper method to get category performance
    getCategoryPerformance(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categoryStats = yield attempt_1.default.aggregate([
                    { $match: { user: new mongoose_1.default.Types.ObjectId(userId) } },
                    {
                        $lookup: {
                            from: 'questions',
                            localField: 'question',
                            foreignField: '_id',
                            as: 'questionData'
                        }
                    },
                    { $unwind: '$questionData' },
                    {
                        $group: {
                            _id: '$questionData.category',
                            totalAttempts: { $sum: 1 },
                            correctAttempts: {
                                $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] }
                            },
                            timeSpent: { $sum: '$timeSpent' }
                        }
                    },
                    {
                        $project: {
                            category: '$_id',
                            totalAttempts: 1,
                            correctAttempts: 1,
                            timeSpent: 1,
                            accuracy: {
                                $multiply: [
                                    { $divide: ['$correctAttempts', '$totalAttempts'] },
                                    100
                                ]
                            }
                        }
                    },
                    { $sort: { category: 1 } }
                ]);
                return categoryStats.length > 0 ? categoryStats : this.generateMockCategoryData();
            }
            catch (error) {
                logger_1.default.error('Error getting category performance:', error);
                return this.generateMockCategoryData();
            }
        });
    }
    // Helper method to get recent activity
    getRecentActivity(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 5) {
            try {
                const recentAttempts = yield attempt_1.default.find({ user: userId })
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .populate('question', 'title content')
                    .lean();
                if (recentAttempts.length === 0) {
                    return this.generateMockActivity();
                }
                return recentAttempts.map(attempt => {
                    const question = attempt.question;
                    return {
                        date: attempt.createdAt,
                        action: `Answered question: ${question.title || 'Untitled'}`,
                        score: attempt.isCorrect ? 1 : 0,
                        total: 1
                    };
                });
            }
            catch (error) {
                logger_1.default.error('Error getting recent activity:', error);
                return this.generateMockActivity();
            }
        });
    }
    // Helper method to get time data (last 4 weeks)
    getTimeData(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get date 4 weeks ago
                const fourWeeksAgo = new Date();
                fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
                const weeklyData = yield attempt_1.default.aggregate([
                    {
                        $match: {
                            user: new mongoose_1.default.Types.ObjectId(userId),
                            createdAt: { $gte: fourWeeksAgo }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                            },
                            questions: { $sum: 1 },
                            correct: {
                                $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] }
                            },
                            timeSpent: { $sum: '$timeSpent' }
                        }
                    },
                    {
                        $project: {
                            date: '$_id',
                            questions: 1,
                            score: {
                                $multiply: [
                                    { $divide: ['$correct', '$questions'] },
                                    100
                                ]
                            },
                            timeSpent: 1
                        }
                    },
                    { $sort: { date: 1 } }
                ]);
                if (weeklyData.length === 0) {
                    return this.generateMockTimeData();
                }
                return weeklyData;
            }
            catch (error) {
                logger_1.default.error('Error getting time data:', error);
                return this.generateMockTimeData();
            }
        });
    }
    // Generate mock analytics data for fallback
    generateMockAnalytics() {
        // Generate random stats for development
        const questionsAttempted = Math.floor(Math.random() * 50) + 10;
        const questionsCorrect = Math.floor(Math.random() * questionsAttempted);
        const completionRate = Math.floor(Math.random() * 30) + 60; // percentage
        return {
            // Stats used by the dashboard
            stats: {
                completionRate: completionRate,
                questionsAttempted: questionsAttempted,
                questionsCorrect: questionsCorrect,
                accuracy: Math.floor((questionsCorrect / questionsAttempted) * 100) || 0,
                streak: Math.floor(Math.random() * 7) + 1,
                timeSpent: Math.floor(Math.random() * 200) + 50 // minutes
            },
            // Legacy fields for compatibility
            completedQuestions: questionsAttempted,
            correctAnswers: questionsCorrect,
            accuracy: Math.floor((questionsCorrect / questionsAttempted) * 100) || 0,
            timeSpent: Math.floor(Math.random() * 200) + 50, // minutes
            streak: Math.floor(Math.random() * 7) + 1,
            recentActivity: this.generateMockActivity(),
            performanceByCategory: [
                { category: 'Math', correct: Math.floor(Math.random() * 10) + 5, total: 20 },
                { category: 'Science', correct: Math.floor(Math.random() * 8) + 3, total: 15 },
                { category: 'English', correct: Math.floor(Math.random() * 5) + 2, total: 10 }
            ],
            // Add data for charts
            categoryData: [
                { name: 'Math', completion: 75, correct: 65, incorrect: 10, total: 20 },
                { name: 'Science', completion: 60, correct: 45, incorrect: 15, total: 15 },
                { name: 'English', completion: 80, correct: 70, incorrect: 10, total: 10 }
            ],
            timeData: this.generateMockTimeData(),
            strengthData: [
                { subject: 'Algebra', score: 75 },
                { subject: 'Geometry', score: 65 },
                { subject: 'Biology', score: 80 },
                { subject: 'Chemistry', score: 70 },
                { subject: 'Grammar', score: 85 }
            ],
            timeSpentData: [
                { name: 'Math', value: 45 },
                { name: 'Science', value: 30 },
                { name: 'English', value: 25 }
            ],
            questionsByCategory: [
                { name: 'Math', value: 40 },
                { name: 'Science', value: 30 },
                { name: 'English', value: 20 },
                { name: 'History', value: 10 }
            ]
        };
    }
    // Generate mock category data
    generateMockCategoryData() {
        return [
            {
                category: 'Math',
                totalAttempts: 20,
                correctAttempts: 15,
                timeSpent: 1200,
                accuracy: 75
            },
            {
                category: 'Science',
                totalAttempts: 15,
                correctAttempts: 10,
                timeSpent: 900,
                accuracy: 66.67
            },
            {
                category: 'English',
                totalAttempts: 10,
                correctAttempts: 8,
                timeSpent: 600,
                accuracy: 80
            }
        ];
    }
    // Generate mock activity data
    generateMockActivity() {
        return [
            {
                date: new Date(),
                action: 'Completed practice set',
                score: Math.floor(Math.random() * 5) + 5,
                total: 10
            }
        ];
    }
    // Generate mock time data
    generateMockTimeData() {
        const today = new Date();
        const date1 = new Date(today);
        date1.setDate(today.getDate() - 21);
        const date2 = new Date(today);
        date2.setDate(today.getDate() - 14);
        const date3 = new Date(today);
        date3.setDate(today.getDate() - 7);
        return [
            {
                date: date1.toISOString().split('T')[0],
                score: 65,
                questions: 10,
                timeSpent: 30
            },
            {
                date: date2.toISOString().split('T')[0],
                score: 70,
                questions: 12,
                timeSpent: 35
            },
            {
                date: date3.toISOString().split('T')[0],
                score: 75,
                questions: 15,
                timeSpent: 40
            },
            {
                date: today.toISOString().split('T')[0],
                score: 80,
                questions: 18,
                timeSpent: 45
            }
        ];
    }
    // Get analytics for a teacher
    getTeacherAnalytics(teacherId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if the teacher exists
                const teacher = yield userModel_1.User.findById(teacherId);
                if (!teacher) {
                    throw new Error('Teacher not found');
                }
                // Get classrooms the teacher manages
                const classrooms = yield classroom_1.default.find({ teacherId })
                    .select('_id name students')
                    .lean();
                // Get assignments for these classrooms
                const classroomIds = classrooms.map(c => c._id);
                const assignments = yield assignment_1.default.find({
                    classroomId: { $in: classroomIds }
                }).lean();
                // Get student IDs from all classrooms
                const allStudentIds = [];
                classrooms.forEach(classroom => {
                    if (classroom.students && Array.isArray(classroom.students)) {
                        allStudentIds.push(...classroom.students);
                    }
                });
                // Get attempt data for students in these classrooms
                const attempts = yield attempt_1.default.find({
                    user: { $in: allStudentIds }
                }).lean();
                // Calculate average score
                const correctAttempts = attempts.filter(a => a.isCorrect).length;
                const averageScore = attempts.length > 0
                    ? Math.floor((correctAttempts / attempts.length) * 100)
                    : 70; // Fallback to mock data
                // Calculate classroom performance
                const classroomPerformance = yield Promise.all(classrooms.map((classroom) => __awaiter(this, void 0, void 0, function* () {
                    const studentIds = classroom.students && Array.isArray(classroom.students)
                        ? classroom.students
                        : [];
                    // Get attempts for students in this classroom
                    const classroomAttempts = yield attempt_1.default.find({
                        user: { $in: studentIds }
                    }).lean();
                    const correct = classroomAttempts.filter(a => a.isCorrect).length;
                    const avgScore = classroomAttempts.length > 0
                        ? Math.floor((correct / classroomAttempts.length) * 100)
                        : Math.floor(Math.random() * 20) + 70; // Fallback
                    // Calculate completion rate (mock for now)
                    const completionRate = Math.floor(Math.random() * 30) + 60;
                    return {
                        name: classroom.name,
                        studentCount: studentIds.length,
                        averageScore: avgScore,
                        completionRate: completionRate
                    };
                })));
                return {
                    totalStudents: allStudentIds.length,
                    totalClassrooms: classrooms.length,
                    activeAssignments: assignments.length,
                    averageScore: averageScore,
                    classroomPerformance: classroomPerformance
                };
            }
            catch (error) {
                logger_1.default.error('Error getting teacher analytics:', error);
                // Fallback to mock data
                return {
                    totalStudents: 0,
                    totalClassrooms: 0,
                    activeAssignments: 0,
                    averageScore: 70,
                    classroomPerformance: []
                };
            }
        });
    }
    // Get student analytics using progress data
    getStudentAnalyticsUsingProgress(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get user's progress data
                const progress = yield progressModel_1.Progress.find({ userId });
                // Calculate statistics
                const totalQuestions = progress.length;
                const correctAnswers = progress.filter(p => p.isCorrect).length;
                const averageScore = totalQuestions > 0
                    ? (correctAnswers / totalQuestions) * 100
                    : 0;
                // Get recent activity
                const recentActivity = yield progressModel_1.Progress.find({ userId })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('isCorrect score timeSpent createdAt')
                    .lean();
                // Format activity for response
                const formattedActivity = recentActivity.map(activity => this.formatActivityData(activity));
                return {
                    stats: {
                        questionsAttempted: totalQuestions,
                        correctAnswers,
                        averageScore,
                        timeSpent: progress.reduce((acc, curr) => acc + curr.timeSpent, 0)
                    },
                    recentActivity: formattedActivity
                };
            }
            catch (error) {
                logger_1.default.error('Error in getStudentAnalytics:', error);
                throw error;
            }
        });
    }
}
exports.default = AnalyticsService;
