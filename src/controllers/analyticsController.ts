import { Request, Response } from 'express';
import { Progress } from '../models/progressModel';
import { User } from '../models/userModel';
import AnalyticsService from '../services/analyticsService';
import logger from '../utils/logger';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getStudentAnalytics(req: Request, res: Response) {
    try {
      const userId = req.params.userId || req.user!.id;
      const analytics = await analyticsService.getStudentAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      logger.error('Error fetching student analytics:', error);
      res.status(500).json({ message: 'Error fetching student analytics' });
    }
  }

  async getTeacherAnalytics(req: Request, res: Response) {
    try {
      const analytics = await analyticsService.getTeacherAnalytics(req.user!.id);
      res.json(analytics);
    } catch (error) {
      logger.error('Error fetching teacher analytics:', error);
      res.status(500).json({ message: 'Error fetching teacher analytics' });
    }
  }

  async getStudentProgress(req: Request, res: Response) {
    try {
      const userId = req.params.userId || req.user!.id;
      const progress = await Progress.find({ userId })
        .populate('questionId', 'title content type options difficulty category')
        .sort({ createdAt: -1 })
        .limit(50);

      res.json(progress);
    } catch (error) {
      logger.error('Error fetching student progress:', error);
      res.status(500).json({ message: 'Error fetching student progress' });
    }
  }
} 