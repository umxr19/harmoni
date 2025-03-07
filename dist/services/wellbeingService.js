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
const moodRating_1 = __importDefault(require("../models/moodRating"));
const journalEntry_1 = __importDefault(require("../models/journalEntry"));
const activity_1 = __importDefault(require("../models/activity"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
class WellbeingService {
    /**
     * Save a new mood rating
     */
    saveMoodRating(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const moodRating = new moodRating_1.default(Object.assign(Object.assign({ userId: new mongoose_1.default.Types.ObjectId(userId) }, data), { timestamp: new Date() }));
                return yield moodRating.save();
            }
            catch (error) {
                logger_1.default.error('Error saving mood rating:', error);
                throw error;
            }
        });
    }
    /**
     * Get average mood rating for a user
     */
    getAverageMoodRating(userId, timeframe) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = { userId: new mongoose_1.default.Types.ObjectId(userId) };
                // Add timeframe filter if provided
                if (timeframe) {
                    const now = new Date();
                    let startDate = new Date();
                    switch (timeframe) {
                        case '1week':
                            startDate.setDate(now.getDate() - 7);
                            break;
                        case '1month':
                            startDate.setMonth(now.getMonth() - 1);
                            break;
                        case '3months':
                            startDate.setMonth(now.getMonth() - 3);
                            break;
                        case '6months':
                            startDate.setMonth(now.getMonth() - 6);
                            break;
                        case '1year':
                            startDate.setFullYear(now.getFullYear() - 1);
                            break;
                        default:
                            // Default to 1 month if invalid timeframe
                            startDate.setMonth(now.getMonth() - 1);
                    }
                    query.timestamp = { $gte: startDate };
                }
                const result = yield moodRating_1.default.aggregate([
                    { $match: query },
                    { $group: {
                            _id: null,
                            averageMood: { $avg: '$moodValue' }
                        }
                    }
                ]);
                return result.length > 0 ? parseFloat(result[0].averageMood.toFixed(2)) : 0;
            }
            catch (error) {
                logger_1.default.error('Error getting average mood rating:', error);
                throw error;
            }
        });
    }
    /**
     * Get mood ratings for a user
     */
    getMoodRatings(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 10, skip = 0, timeframe) {
            try {
                const query = { userId: new mongoose_1.default.Types.ObjectId(userId) };
                // Add timeframe filter if provided
                if (timeframe) {
                    const now = new Date();
                    let startDate = new Date();
                    switch (timeframe) {
                        case '1week':
                            startDate.setDate(now.getDate() - 7);
                            break;
                        case '1month':
                            startDate.setMonth(now.getMonth() - 1);
                            break;
                        case '3months':
                            startDate.setMonth(now.getMonth() - 3);
                            break;
                        case '6months':
                            startDate.setMonth(now.getMonth() - 6);
                            break;
                        case '1year':
                            startDate.setFullYear(now.getFullYear() - 1);
                            break;
                        default:
                            // Default to 1 month if invalid timeframe
                            startDate.setMonth(now.getMonth() - 1);
                    }
                    query.timestamp = { $gte: startDate };
                }
                return yield moodRating_1.default.find(query)
                    .sort({ timestamp: -1 })
                    .skip(skip)
                    .limit(limit);
            }
            catch (error) {
                logger_1.default.error('Error getting mood ratings:', error);
                throw error;
            }
        });
    }
    /**
     * Save a new journal entry
     */
    saveJournalEntry(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const journalEntry = new journalEntry_1.default(Object.assign(Object.assign({ userId: new mongoose_1.default.Types.ObjectId(userId) }, data), { timestamp: new Date() }));
                return yield journalEntry.save();
            }
            catch (error) {
                logger_1.default.error('Error saving journal entry:', error);
                throw error;
            }
        });
    }
    /**
     * Get journal entries for a user
     */
    getJournalEntries(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 10, skip = 0, timeframe) {
            try {
                const query = { userId: new mongoose_1.default.Types.ObjectId(userId) };
                // Add timeframe filter if provided
                if (timeframe) {
                    const now = new Date();
                    let startDate = new Date();
                    switch (timeframe) {
                        case '1week':
                            startDate.setDate(now.getDate() - 7);
                            break;
                        case '1month':
                            startDate.setMonth(now.getMonth() - 1);
                            break;
                        case '3months':
                            startDate.setMonth(now.getMonth() - 3);
                            break;
                        case '6months':
                            startDate.setMonth(now.getMonth() - 6);
                            break;
                        case '1year':
                            startDate.setFullYear(now.getFullYear() - 1);
                            break;
                        default:
                            // Default to 1 month if invalid timeframe
                            startDate.setMonth(now.getMonth() - 1);
                    }
                    query.timestamp = { $gte: startDate };
                }
                return yield journalEntry_1.default.find(query)
                    .sort({ timestamp: -1 })
                    .skip(skip)
                    .limit(limit);
            }
            catch (error) {
                logger_1.default.error('Error getting journal entries:', error);
                throw error;
            }
        });
    }
    /**
     * Delete a journal entry
     */
    deleteJournalEntry(userId, entryId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ensure the entry belongs to the user before deleting
                const result = yield journalEntry_1.default.deleteOne({
                    _id: new mongoose_1.default.Types.ObjectId(entryId),
                    userId: new mongoose_1.default.Types.ObjectId(userId)
                });
                // Return true if an entry was deleted, false otherwise
                return result.deletedCount > 0;
            }
            catch (error) {
                logger_1.default.error('Error deleting journal entry:', error);
                throw error;
            }
        });
    }
    /**
     * Get total study hours for a user
     */
    getTotalStudyHours(userId, timeframe) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = { userId: new mongoose_1.default.Types.ObjectId(userId) };
                // Add timeframe filter if provided
                if (timeframe) {
                    const now = new Date();
                    let startDate = new Date();
                    switch (timeframe) {
                        case '1week':
                            startDate.setDate(now.getDate() - 7);
                            break;
                        case '1month':
                            startDate.setMonth(now.getMonth() - 1);
                            break;
                        case '3months':
                            startDate.setMonth(now.getMonth() - 3);
                            break;
                        case '6months':
                            startDate.setMonth(now.getMonth() - 6);
                            break;
                        case '1year':
                            startDate.setFullYear(now.getFullYear() - 1);
                            break;
                        default:
                            // Default to 1 month if invalid timeframe
                            startDate.setMonth(now.getMonth() - 1);
                    }
                    query.createdAt = { $gte: startDate };
                }
                // Aggregate total time spent across all activities
                const result = yield activity_1.default.aggregate([
                    { $match: query },
                    { $group: {
                            _id: null,
                            totalTimeSpent: { $sum: '$result.timeSpent' }
                        }
                    }
                ]);
                // Convert milliseconds to hours and round to 2 decimal places
                const totalHours = result.length > 0 ? parseFloat((result[0].totalTimeSpent / (1000 * 60 * 60)).toFixed(2)) : 0;
                return totalHours;
            }
            catch (error) {
                logger_1.default.error('Error getting total study hours:', error);
                throw error;
            }
        });
    }
    /**
     * Get wellbeing summary for a user
     */
    getWellbeingSummary(userId, timeframe) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [averageMood, totalStudyHours, recentMoodRatings, recentJournalEntries] = yield Promise.all([
                    this.getAverageMoodRating(userId, timeframe),
                    this.getTotalStudyHours(userId, timeframe),
                    this.getMoodRatings(userId, 5, 0, timeframe),
                    this.getJournalEntries(userId, 5, 0, timeframe)
                ]);
                return {
                    averageMood,
                    totalStudyHours,
                    recentMoodRatings,
                    recentJournalEntries
                };
            }
            catch (error) {
                logger_1.default.error('Error getting wellbeing summary:', error);
                throw error;
            }
        });
    }
}
exports.default = WellbeingService;
