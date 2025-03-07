import { Router, Response, RequestHandler } from 'express';
import { openaiController } from '../controllers/openaiController';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware as RequestHandler);

// Tutor endpoint
router.post('/tutor', (async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { question, context } = req.body;
    const response = await openaiController.getTutorResponse(question, context, req.user.id);
    res.json({
      success: true,
      response: response
    });
  } catch (error) {
    console.error('Error in tutor endpoint:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) as RequestHandler);

// Study schedule generation endpoint
router.post('/study-schedule', (async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const schedule = await openaiController.generateStudySchedule(req.body, req.user);
    res.json({
      success: true,
      response: schedule
    });
  } catch (error) {
    console.error('Error in study schedule endpoint:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) as RequestHandler);

export default router; 