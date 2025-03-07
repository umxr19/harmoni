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
exports.studyScheduleService = exports.StudyScheduleService = void 0;
const openaiService_1 = require("./openaiService");
const wellbeingService_1 = __importDefault(require("./wellbeingService"));
const progressService_1 = __importDefault(require("./progressService"));
const redisService_1 = require("./redisService");
const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds
class StudyScheduleService {
    getUserData(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch mood ratings from wellbeing service
            const moodHistory = yield wellbeingService_1.default.getMoodRatings(userId);
            const moodRatings = moodHistory.map((m) => m.rating);
            // Calculate mood trend
            const moodTrend = this.calculateMoodTrend(moodRatings);
            // Get performance data
            const performance = yield progressService_1.default.getPerformanceData(userId);
            const subjects = performance.map((p) => ({
                subject: p.subject,
                score: p.score
            }));
            // Get journal entries and analyze sentiment
            const journalEntries = yield wellbeingService_1.default.getJournalEntries(userId);
            const journalSentiment = yield this.analyzeJournalSentiment(journalEntries);
            // Get user preferences
            const preferences = yield this.getUserPreferences(userId);
            // Get last study date
            const lastStudyDate = yield this.getLastStudyDate(userId);
            return {
                moodData: {
                    rating: moodRatings.reduce((a, b) => a + b, 0) / moodRatings.length,
                    timestamp: new Date()
                },
                performance: subjects.map(p => ({
                    subject: p.subject,
                    score: p.score,
                    lastStudied: lastStudyDate
                })),
                journalSentiment,
                preferences,
                lastStudyDate
            };
        });
    }
    calculateMoodTrend(ratings) {
        if (ratings.length < 2)
            return 'stable';
        const recentRatings = ratings.slice(-5); // Look at last 5 ratings
        const trend = recentRatings.reduce((a, b, i) => {
            if (i === 0)
                return 0;
            return a + (b - recentRatings[i - 1]);
        }, 0);
        if (trend > 0.5)
            return 'improving';
        if (trend < -0.5)
            return 'declining';
        return 'stable';
    }
    analyzeJournalSentiment(entries) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield openaiService_1.openAIService.generateChatCompletion([
                    {
                        role: 'system',
                        content: 'Analyze the sentiment of these journal entries. Return a number between -1 (negative) and 1 (positive), and a brief mood description.'
                    },
                    {
                        role: 'user',
                        content: entries.join('\n')
                    }
                ], 'system');
                if (!response.success) {
                    throw new Error(response.message);
                }
                const result = JSON.parse(response.response.content);
                return {
                    entries,
                    overallSentiment: result.sentiment,
                    recentMood: result.mood
                };
            }
            catch (error) {
                console.error('Error analyzing journal sentiment:', error);
                return {
                    entries,
                    overallSentiment: 0,
                    recentMood: 'neutral'
                };
            }
        });
    }
    generateAISchedule(userData, user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield openaiService_1.openAIService.generateStudySchedule(userData, user);
                if (!response.success) {
                    throw new Error(response.message);
                }
                const schedule = JSON.parse(response.response.content);
                return {
                    userId: user.id,
                    weekStartDate: new Date(),
                    schedule,
                    generatedAt: new Date(),
                    isAIGenerated: true
                };
            }
            catch (error) {
                console.error('Error generating AI schedule:', error);
                return null;
            }
        });
    }
    generateFallbackSchedule(userData) {
        // Implement fallback logic based on basic rules
        const schedule = {};
        const subjects = userData.performance.sort((a, b) => a.score - b.score);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        days.forEach((day, index) => {
            const subject = subjects[index % subjects.length];
            schedule[day] = {
                subject: subject.subject,
                duration: '45 mins',
                focus: 'Core concepts',
                motivation: 'Keep going!',
                difficulty: 'medium'
            };
        });
        return {
            userId: userData.userId,
            weekStartDate: new Date(),
            schedule,
            generatedAt: new Date(),
            isAIGenerated: false
        };
    }
    generateWeeklySchedule(user) {
        return __awaiter(this, void 0, void 0, function* () {
            // Try to get cached schedule
            const cachedSchedule = yield redisService_1.redisService.get(`schedule:${user.id}`);
            if (cachedSchedule) {
                return JSON.parse(cachedSchedule);
            }
            // Gather all user data
            const userData = yield this.getUserData(user.id);
            // Try to generate AI schedule
            const aiSchedule = yield this.generateAISchedule(userData, user);
            // Use fallback if AI generation fails
            const finalSchedule = aiSchedule || this.generateFallbackSchedule(Object.assign(Object.assign({}, userData), { userId: user.id }));
            // Cache the schedule
            yield redisService_1.redisService.set(`schedule:${user.id}`, JSON.stringify(finalSchedule), CACHE_TTL);
            return finalSchedule;
        });
    }
    invalidateScheduleCache(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield redisService_1.redisService.del(`schedule:${userId}`);
        });
    }
    getUserPreferences(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement fetching from database
            return {
                preferredStudyTime: 'evening',
                breakDays: ['Sunday'],
                maxDailyHours: 3
            };
        });
    }
    getLastStudyDate(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement fetching from database
            return new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
        });
    }
    generateSchedule(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch mood ratings from wellbeing service
                const moodHistory = yield wellbeingService_1.default.getMoodRatings(userId);
                const moodRatings = moodHistory.map((m) => m.rating);
                // Calculate mood trend
                const moodTrend = this.calculateMoodTrend(moodRatings);
                // Get performance data
                const performance = yield progressService_1.default.getPerformanceData(userId);
                const subjects = performance.map((p) => ({
                    subject: p.subject,
                    score: p.score
                }));
                // Get recent journal entries
                const journalEntries = yield wellbeingService_1.default.getJournalEntries(userId);
                // ... rest of the code ...
            }
            catch (error) {
                // ... error handling ...
            }
        });
    }
}
exports.StudyScheduleService = StudyScheduleService;
exports.studyScheduleService = new StudyScheduleService();
