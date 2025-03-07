import { openAIService } from './openaiService';
import wellbeingService from './wellbeingService';
import progressService from './progressService';
import { redisService } from './redisService';
import { IUser } from '../models/userModel';
import { StudySchedule, IStudySchedule } from '../models/studySchedule';
import { IMoodRating } from '../models/moodRating';
import { IJournalEntry } from '../models/journalEntry';
import axios from 'axios';
import { StudySchedulePreferences, WeeklySchedule, ScheduleDay } from '../types';
import { isOfflineMode } from './config';
import { mockApi } from './mockApi';
import config from '../config/config';

interface SubjectPerformance {
  subject: string;
  score: number;
  lastStudied: Date;
}

interface MoodData {
  rating: number;
  timestamp: Date;
}

interface JournalSentiment {
  entries: string[];
  overallSentiment: number;
  recentMood: string;
}

interface PerformanceData {
  subject: string;
  score: number;
}

const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

export class StudyScheduleService {
  private isOffline: boolean;

  constructor() {
    this.isOffline = process.env.OFFLINE_MODE === 'true';
  }

  private async getUserData(userId: string): Promise<{
    moodData: { rating: number; timestamp: Date };
    performance: SubjectPerformance[];
    journalSentiment: JournalSentiment;
    preferences: StudySchedulePreferences;
    lastStudyDate: Date;
  }> {
    // Fetch mood ratings from wellbeing service
    const moodHistory = await wellbeingService.getMoodRatings(userId);
    const moodRatings = moodHistory.map((m: IMoodRating) => m.moodValue);
    
    // Calculate mood trend
    const moodTrend = this.calculateMoodTrend(moodRatings);
    
    // Get performance data
    const performance = await progressService.getPerformanceData(userId);
    const subjects = performance.map((p: PerformanceData) => ({
      subject: p.subject,
      score: p.score
    }));
    
    // Get journal entries and analyze sentiment
    const journalEntries = await wellbeingService.getJournalEntries(userId);
    const journalSentiment = await this.analyzeJournalSentiment(
      journalEntries.map(entry => entry.entryText)
    );
    
    // Get user preferences
    const preferences = await this.getUserPreferences(userId);
    
    // Get last study date
    const lastStudyDate = await this.getLastStudyDate(userId);
    
    return {
      moodData: {
        rating: moodRatings.reduce((a: number, b: number) => a + b, 0) / moodRatings.length,
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
  }

  private calculateMoodTrend(ratings: number[]): 'improving' | 'declining' | 'stable' {
    if (ratings.length < 2) return 'stable';
    
    const recentRatings = ratings.slice(-5);
    const trend = recentRatings.reduce((a, b, i) => {
      if (i === 0) return 0;
      return a + (b - recentRatings[i - 1]);
    }, 0);
    
    if (trend > 0.5) return 'improving';
    if (trend < -0.5) return 'declining';
    return 'stable';
  }

  private async analyzeJournalSentiment(entries: string[]): Promise<JournalSentiment> {
    try {
      const response = await openAIService.generateChatCompletion([
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
    } catch (error) {
      console.error('Error analyzing journal sentiment:', error);
      return {
        entries,
        overallSentiment: 0,
        recentMood: 'neutral'
      };
    }
  }

  async generateAISchedule(userData: {
    userId: string;
    moodData: { rating: number; timestamp: Date };
    performance: Array<{ subject: string; score: number }>;
    journalSentiment: { overallSentiment: number; recentMood: string };
    preferences: {
      preferredStudyTime: string;
      preferredRestDay: number;
      maxDailyHours: number;
      focusAreas: string[];
    };
  }): Promise<WeeklySchedule> {
    if (this.isOffline) {
      return mockApi.generateWeeklySchedule(null);
    }

    try {
      const aiResponse = await openAIService.generateStudySchedule(userData);
      
      if (!aiResponse.success || !aiResponse.response?.content) {
        throw new Error('Failed to generate AI schedule');
      }

      const schedule = JSON.parse(aiResponse.response.content);
      const now = new Date();
      const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const days: ScheduleDay[] = schedule.days.map((day: any) => ({
        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
        date: day.date,
        isRestDay: false,
        topics: day.topics.map((topic: any) => ({
          subject: topic.subject,
          duration: `${topic.duration} minutes`,
          focus: topic.focus || 'General review'
        })),
        totalDuration: day.topics.reduce((total: number, topic: any) => total + topic.duration, 0) + ' minutes',
        completed: false,
        motivationalMessage: 'Keep up the great work!'
      }));

      return {
        userId: userData.userId,
        week: 1,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        days,
        restDayIndex: userData.preferences.preferredRestDay,
        averageMood: userData.moodData.rating
      };
    } catch (error) {
      console.error('Error generating AI schedule:', error);
      return mockApi.generateWeeklySchedule(null);
    }
  }

  private generateFallbackSchedule(userData: any): WeeklySchedule {
    const days: ScheduleDay[] = [];
    const subjects = userData.performance.sort((a: any, b: any) => a.score - b.score);
    
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach((day, index) => {
      const subject = subjects[index % subjects.length];
      days.push({
        day,
        date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString(),
        isRestDay: false,
        topics: [{
          subject: subject.subject,
          duration: '45 mins',
          focus: 'Core concepts'
        }],
        totalDuration: '45 mins',
        completed: false,
        motivationalMessage: 'Keep going!'
      });
    });

    return {
      userId: userData.userId,
      week: 1,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      days,
      restDayIndex: 6,
      averageMood: 0
    };
  }

  private async getUserPreferences(userId: string): Promise<StudySchedulePreferences> {
    // TODO: Implement fetching from database
    return {
      preferredStudyTime: 'evening',
      preferredRestDay: 6,
      maxDailyHours: 3,
      focusAreas: ['Math', 'Science']
    };
  }

  private async getLastStudyDate(userId: string): Promise<Date> {
    // TODO: Implement fetching from database
    return new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
  }

  async saveSchedulePreferences(preferences: StudySchedulePreferences): Promise<WeeklySchedule> {
    if (this.isOffline) {
      return mockApi.saveSchedulePreferences(preferences);
    }
    const response = await axios.post<WeeklySchedule>('/api/study-schedule/preferences', preferences);
    return response.data;
  }

  async getWeeklySchedule(): Promise<WeeklySchedule> {
    if (this.isOffline) {
      return mockApi.getWeeklySchedule();
    }

    try {
      // In a real implementation, this would fetch the schedule from a database
      return mockApi.getWeeklySchedule();
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  async markDayCompleted(date: string, mood?: number): Promise<WeeklySchedule> {
    if (this.isOffline) {
      return mockApi.markDayCompleted(date, mood);
    }

    try {
      // In a real implementation, this would update the schedule in a database
      return mockApi.markDayCompleted(date, mood);
    } catch (error) {
      console.error('Error marking day as completed:', error);
      throw error;
    }
  }

  async updateScheduleDay(date: string, updates: Partial<ScheduleDay>): Promise<WeeklySchedule> {
    if (this.isOffline) {
      return mockApi.updateScheduleDay(date, updates);
    }
    const response = await axios.patch<WeeklySchedule>(`/api/study-schedule/day/${date}`, updates);
    return response.data;
  }
}

export const studyScheduleService = new StudyScheduleService(); 