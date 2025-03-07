import { Request, Response, NextFunction } from 'express';
import { studyScheduleService } from '../services/studyScheduleService';
import { catchAsync } from '../utils/catchAsync';
import { IUser } from '../models/userModel';
import { User } from '../models/userModel';
import { JwtPayload } from '../middleware/authMiddleware';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export const studyScheduleController = {
  getWeeklySchedule: catchAsync<AuthenticatedRequest>(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Fetch the full user document from the database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // First try to get existing schedule
    let schedule = await studyScheduleService.getWeeklySchedule();
    
    // If no schedule exists, generate a new one
    if (!schedule) {
      const userData = {
        userId: user.id,
        moodData: { rating: 0, timestamp: new Date() }, // You might want to fetch this from your mood service
        performance: [], // You might want to fetch this from your progress service
        journalSentiment: {
          overallSentiment: 0,
          recentMood: 'neutral'
        },
        preferences: {
          preferredStudyTime: 'evening',
          preferredRestDay: 6,
          maxDailyHours: 3,
          focusAreas: ['Math', 'Science']
        }
      };
      
      schedule = await studyScheduleService.generateAISchedule(userData);
    }
    
    return res.status(200).json({
      success: true,
      data: schedule
    });
  }),

  refreshSchedule: catchAsync<AuthenticatedRequest>(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = {
      userId: user.id,
      moodData: { rating: 0, timestamp: new Date() },
      performance: [],
      journalSentiment: {
        overallSentiment: 0,
        recentMood: 'neutral'
      },
      preferences: {
        preferredStudyTime: 'evening',
        preferredRestDay: 6,
        maxDailyHours: 3,
        focusAreas: ['Math', 'Science']
      }
    };
    
    const schedule = await studyScheduleService.generateAISchedule(userData);
    
    return res.status(200).json({
      success: true,
      data: schedule
    });
  })
}; 