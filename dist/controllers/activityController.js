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
exports.getCategoryAnalytics = exports.getUserActivity = exports.getUserAnalytics = exports.logActivity = void 0;
const activity_1 = __importDefault(require("../models/activity"));
const logger_1 = __importDefault(require("../utils/logger"));
// Use the extended Express.Request type instead
// interface AuthenticatedRequest extends Request {
//     user: {
//         id: string;
//         role: string;
//     };
// }
// Log a new activity
const logActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, entityId, result, metadata } = req.body;
        if (!req.user || !('id' in req.user)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.user.id;
        const activityData = Object.assign(Object.assign({}, req.body), { userId });
        const activity = new activity_1.default(activityData);
        yield activity.save();
        res.status(201).json({
            success: true,
            activityId: activity._id
        });
    }
    catch (error) {
        logger_1.default.error('Error logging activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to log activity',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.logActivity = logActivity;
// Get user analytics
const getUserAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !('id' in req.user)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.user.id;
        const timeframe = req.query.timeframe || '1month';
        // Calculate the start date based on timeframe
        const now = new Date();
        let startDate = new Date(now);
        switch (timeframe) {
            case '1month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case '6months':
                startDate.setMonth(now.getMonth() - 6);
                break;
            case '1year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(now.getMonth() - 1); // Default to 1 month
        }
        // Find activities within the timeframe
        const activities = yield activity_1.default.find({
            userId,
            createdAt: { $gte: startDate }
        }).sort({ createdAt: 1 });
        if (!activities || activities.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No activity data found for this timeframe',
                data: {}
            });
        }
        // Process the activities to generate analytics
        const analyticsData = processActivitiesForAnalytics(activities, timeframe);
        res.status(200).json({
            success: true,
            data: analyticsData
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching user analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getUserAnalytics = getUserAnalytics;
// Get user activity history
const getUserActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !('id' in req.user)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        const activities = yield activity_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);
        // Format activities for the frontend
        const formattedActivities = activities.map(activity => {
            var _a, _b;
            return ({
                id: activity._id,
                type: activity.type,
                title: ((_a = activity.metadata) === null || _a === void 0 ? void 0 : _a.title) || `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} Activity`,
                date: activity.createdAt,
                score: activity.result.score,
                correct: activity.result.isCorrect ? 1 : 0,
                total: 1,
                category: ((_b = activity.metadata) === null || _b === void 0 ? void 0 : _b.category) || 'General'
            });
        });
        res.status(200).json(formattedActivities);
    }
    catch (error) {
        logger_1.default.error('Error getting user activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user activity',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getUserActivity = getUserActivity;
// Get analytics for a specific category
const getCategoryAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !('id' in req.user)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.user.id;
        const { category } = req.params;
        // Get all user activities for the specified category
        const activities = yield activity_1.default.find({
            userId,
            'metadata.category': category
        });
        // Process activities to generate category-specific analytics
        const analytics = processCategoryActivities(activities, category);
        res.status(200).json(analytics);
    }
    catch (error) {
        logger_1.default.error(`Error getting analytics for category ${req.params.category}:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to get category analytics',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getCategoryAnalytics = getCategoryAnalytics;
// Helper function to process activities for analytics
function processActivitiesForAnalytics(activities, timeframe) {
    // Group activities by category
    const categoryGroups = {};
    const timeData = [];
    const categoryTotal = {};
    // Process activities by date for time series data
    const dateGroups = {};
    activities.forEach(activity => {
        var _a;
        // Process category data
        const category = ((_a = activity.metadata) === null || _a === void 0 ? void 0 : _a.category) || 'Uncategorized';
        if (!categoryGroups[category]) {
            categoryGroups[category] = [];
            categoryTotal[category] = 0;
        }
        categoryGroups[category].push(activity);
        categoryTotal[category]++;
        // Process time series data
        const date = activity.createdAt.toISOString().split('T')[0];
        if (!dateGroups[date]) {
            dateGroups[date] = {
                correct: 0,
                total: 0,
                timeSpent: 0
            };
        }
        dateGroups[date].total++;
        if (activity.result.isCorrect) {
            dateGroups[date].correct++;
        }
        dateGroups[date].timeSpent += activity.result.timeSpent || 0;
    });
    // Format category data
    const categoryData = Object.keys(categoryGroups).map(category => {
        const activities = categoryGroups[category];
        const total = activities.length;
        const correct = activities.filter(a => a.result.isCorrect).length;
        return {
            name: category,
            completion: Math.round((total / (total + 5)) * 100), // Estimate completion
            correct: Math.round((correct / total) * 100),
            incorrect: Math.round(((total - correct) / total) * 100),
            total
        };
    });
    // Format time series data
    // For longer timeframes, we may want to aggregate by week or month
    const aggregateByDay = timeframe === '1month';
    const aggregateByWeek = timeframe === '6months';
    const aggregateByMonth = timeframe === '1year';
    let formattedTimeData = [];
    if (aggregateByDay) {
        // Daily data for 1 month
        formattedTimeData = Object.keys(dateGroups).map(date => {
            const data = dateGroups[date];
            return {
                date,
                score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
                questions: data.total,
                timeSpent: Math.round(data.timeSpent / 60) // Convert to minutes
            };
        });
    }
    else if (aggregateByWeek) {
        // Weekly aggregation for 6 months
        const weekGroups = {};
        Object.keys(dateGroups).forEach(dateStr => {
            const date = new Date(dateStr);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
            const weekKey = weekStart.toISOString().split('T')[0];
            if (!weekGroups[weekKey]) {
                weekGroups[weekKey] = {
                    correct: 0,
                    total: 0,
                    timeSpent: 0
                };
            }
            weekGroups[weekKey].correct += dateGroups[dateStr].correct;
            weekGroups[weekKey].total += dateGroups[dateStr].total;
            weekGroups[weekKey].timeSpent += dateGroups[dateStr].timeSpent;
        });
        formattedTimeData = Object.keys(weekGroups).map(weekKey => {
            const data = weekGroups[weekKey];
            return {
                date: `Week of ${weekKey}`,
                score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
                questions: data.total,
                timeSpent: Math.round(data.timeSpent / 60) // Convert to minutes
            };
        });
    }
    else {
        // Monthly aggregation for 1 year
        const monthGroups = {};
        Object.keys(dateGroups).forEach(dateStr => {
            const date = new Date(dateStr);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthGroups[monthKey]) {
                monthGroups[monthKey] = {
                    correct: 0,
                    total: 0,
                    timeSpent: 0
                };
            }
            monthGroups[monthKey].correct += dateGroups[dateStr].correct;
            monthGroups[monthKey].total += dateGroups[dateStr].total;
            monthGroups[monthKey].timeSpent += dateGroups[dateStr].timeSpent;
        });
        formattedTimeData = Object.keys(monthGroups).map(monthKey => {
            const data = monthGroups[monthKey];
            return {
                date: monthKey,
                score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
                questions: data.total,
                timeSpent: Math.round(data.timeSpent / 60) // Convert to minutes
            };
        });
    }
    return {
        categories: categoryData,
        timeSeries: formattedTimeData
    };
}
// Helper function to process category activities
function processCategoryActivities(activities, category) {
    const total = activities.length;
    const correct = activities.filter(a => a.result.isCorrect).length;
    const totalTimeSpent = activities.reduce((sum, a) => sum + (a.result.timeSpent || 0), 0);
    return {
        category,
        total,
        correct,
        incorrect: total - correct,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        averageTimeSpent: total > 0 ? Math.round(totalTimeSpent / total / 60) : 0 // Convert to minutes
    };
}
