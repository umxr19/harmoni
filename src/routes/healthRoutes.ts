import { Router } from 'express';
import { redisService } from '../services/redisService';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    const redisHealth = await redisService.healthCheck();
    
    res.json({
      status: 'ok',
      redis: {
        status: redisHealth ? 'healthy' : 'unhealthy'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed'
    });
  }
});

export default router; 