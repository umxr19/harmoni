import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import logger from "../utils/logger";

// Use in-memory cache for development, can be replaced with Redis in production
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Don't clone objects (better performance)
});

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string | ((req: Request) => string); // Custom cache key or function to generate one
}

/**
 * Middleware to cache API responses
 * @param options Cache options
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if user is not authenticated (for personalized data)
    if (!req.user && req.path.includes('/api/')) {
      return next();
    }

    // Generate cache key
    const cacheKey = typeof options.key === 'function'
      ? options.key(req)
      : options.key || `${req.originalUrl}:${req.user?.id || 'anonymous'}`;

    // Try to get from cache
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      logger.info(`Cache hit for ${cacheKey}`);
      return res.status(200).json(cachedResponse);
    }

    // Store the original send method
    const originalSend = res.json;

    // Override the json method
    res.json = function(body) {
      // Store in cache
      const ttl = options.ttl || 300; // Default 5 minutes
      cache.set(cacheKey, body, ttl);
      logger.info(`Cached ${cacheKey} for ${ttl} seconds`);

      // Call the original method
      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Clear cache for a specific key pattern
 * @param keyPattern Key pattern to clear
 */
export const clearCache = (keyPattern: string) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(keyPattern));
  
  if (matchingKeys.length > 0) {
    matchingKeys.forEach(key => cache.del(key));
    logger.info(`Cleared ${matchingKeys.length} cache entries matching ${keyPattern}`);
  }
};

/**
 * Middleware to clear cache when data is modified
 * @param keyPattern Key pattern to clear
 */
export const clearCacheMiddleware = (keyPattern: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store the original send method
    const originalSend = res.json;

    // Override the json method
    res.json = function(body) {
      // Clear cache after successful operation
      if (res.statusCode >= 200 && res.statusCode < 300) {
        clearCache(keyPattern);
      }

      // Call the original method
      return originalSend.call(this, body);
    };

    next();
  };
}; 