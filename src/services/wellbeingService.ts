import MoodRating, { IMoodRating } from '../models/moodRating';
import JournalEntry, { IJournalEntry } from '../models/journalEntry';
import Activity from '../models/activity';
import mongoose from 'mongoose';
import logger from '../utils/logger';

class WellbeingService {
  /**
   * Save a new mood rating
   */
  async saveMoodRating(userId: string, data: {
    sessionId?: string;
    examId?: string;
    moodValue: number;
  }): Promise<IMoodRating> {
    try {
      const moodRating = new MoodRating({
        userId: new mongoose.Types.ObjectId(userId),
        ...data,
        timestamp: new Date()
      });
      
      return await moodRating.save();
    } catch (error) {
      logger.error('Error saving mood rating:', error);
      throw error;
    }
  }

  /**
   * Get average mood rating for a user
   */
  async getAverageMoodRating(userId: string, timeframe?: string): Promise<number> {
    try {
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      
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
      
      const result = await MoodRating.aggregate([
        { $match: query },
        { $group: {
            _id: null,
            averageMood: { $avg: '$moodValue' }
          }
        }
      ]);
      
      return result.length > 0 ? parseFloat(result[0].averageMood.toFixed(2)) : 0;
    } catch (error) {
      logger.error('Error getting average mood rating:', error);
      throw error;
    }
  }

  /**
   * Get mood ratings for a user
   */
  async getMoodRatings(userId: string, limit = 10, skip = 0, timeframe?: string): Promise<IMoodRating[]> {
    try {
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      
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
      
      return await MoodRating.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);
    } catch (error) {
      logger.error('Error getting mood ratings:', error);
      throw error;
    }
  }

  /**
   * Save a new journal entry
   */
  async saveJournalEntry(userId: string, data: {
    entryText: string;
    tags?: string[];
  }): Promise<IJournalEntry> {
    try {
      const journalEntry = new JournalEntry({
        userId: new mongoose.Types.ObjectId(userId),
        ...data,
        timestamp: new Date()
      });
      
      return await journalEntry.save();
    } catch (error) {
      logger.error('Error saving journal entry:', error);
      throw error;
    }
  }

  /**
   * Get journal entries for a user
   */
  async getJournalEntries(userId: string, limit = 10, skip = 0, timeframe?: string): Promise<IJournalEntry[]> {
    try {
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      
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
      
      return await JournalEntry.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);
    } catch (error) {
      logger.error('Error getting journal entries:', error);
      throw error;
    }
  }

  /**
   * Delete a journal entry
   */
  async deleteJournalEntry(userId: string, entryId: string): Promise<boolean> {
    try {
      // Ensure the entry belongs to the user before deleting
      const result = await JournalEntry.deleteOne({
        _id: new mongoose.Types.ObjectId(entryId),
        userId: new mongoose.Types.ObjectId(userId)
      });
      
      // Return true if an entry was deleted, false otherwise
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Error deleting journal entry:', error);
      throw error;
    }
  }

  /**
   * Get total study hours for a user
   */
  async getTotalStudyHours(userId: string, timeframe?: string): Promise<number> {
    try {
      const query: any = { userId: new mongoose.Types.ObjectId(userId) };
      
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
      const result = await Activity.aggregate([
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
    } catch (error) {
      logger.error('Error getting total study hours:', error);
      throw error;
    }
  }

  /**
   * Get wellbeing summary for a user
   */
  async getWellbeingSummary(userId: string, timeframe?: string): Promise<{
    averageMood: number;
    totalStudyHours: number;
    recentMoodRatings: IMoodRating[];
    recentJournalEntries: IJournalEntry[];
  }> {
    try {
      const [averageMood, totalStudyHours, recentMoodRatings, recentJournalEntries] = await Promise.all([
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
    } catch (error) {
      logger.error('Error getting wellbeing summary:', error);
      throw error;
    }
  }
}

export default WellbeingService; 