import Redis, { RedisOptions } from 'ioredis';
import config from '../config';
import logger from '../utils/logger';

// Define the expected config shape
interface AppConfig {
  redis: {
    url: string;
  };
  [key: string]: any;
}

class RedisService {
  private client: Redis;

  constructor() {
    const appConfig = config as AppConfig;
    const redisOptions: RedisOptions = {
      retryStrategy: (times: number) => {
        if (times > 3) {
          logger.error('Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 100, 3000);
      }
    };

    this.client = new Redis(appConfig.redis.url, redisOptions);
    logger.info('Redis client connecting');

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return await this.client.setex(key, ttl, value);
    }
    return await this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async checkRateLimit(userId: string): Promise<{ allowed: boolean; error?: string }> {
    const key = `ratelimit:${userId}`;
    const limit = 100; // requests per hour
    const current = await this.client.incr(key);
    
    if (current === 1) {
      await this.client.expire(key, 3600); // 1 hour
    }

    if (current > limit) {
      return {
        allowed: false,
        error: 'Rate limit exceeded'
      };
    }

    return { allowed: true };
  }

  async getRemainingRequests(key: string): Promise<number> {
    const remaining = await this.client.get(`${key}:remaining`);
    return remaining ? parseInt(remaining, 10) : 0;
  }

  async healthCheck(): Promise<{ status: string }> {
    try {
      await this.client.ping();
      return { status: 'healthy' };
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return { status: 'unhealthy' };
    }
  }
}

export const redisService = new RedisService(); 