"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCacheMiddleware = exports.clearCache = exports.cacheMiddleware = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const logger_1 = __importDefault(require("../utils/logger"));
// Use in-memory cache for development, can be replaced with Redis in production
const cache = new node_cache_1.default({
    stdTTL: 300, // 5 minutes default TTL
    checkperiod: 60, // Check for expired keys every 60 seconds
    useClones: false, // Don't clone objects (better performance)
});
/**
 * Middleware to cache API responses
 * @param options Cache options
 */
const cacheMiddleware = (options = {}) => {
    return (req, res, next) => {
        var _a;
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
            : options.key || `${req.originalUrl}:${((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'anonymous'}`;
        // Try to get from cache
        const cachedResponse = cache.get(cacheKey);
        if (cachedResponse) {
            logger_1.default.info(`Cache hit for ${cacheKey}`);
            return res.status(200).json(cachedResponse);
        }
        // Store the original send method
        const originalSend = res.json;
        // Override the json method
        res.json = function (body) {
            // Store in cache
            const ttl = options.ttl || 300; // Default 5 minutes
            cache.set(cacheKey, body, ttl);
            logger_1.default.info(`Cached ${cacheKey} for ${ttl} seconds`);
            // Call the original method
            return originalSend.call(this, body);
        };
        next();
    };
};
exports.cacheMiddleware = cacheMiddleware;
/**
 * Clear cache for a specific key pattern
 * @param keyPattern Key pattern to clear
 */
const clearCache = (keyPattern) => {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(keyPattern));
    if (matchingKeys.length > 0) {
        matchingKeys.forEach(key => cache.del(key));
        logger_1.default.info(`Cleared ${matchingKeys.length} cache entries matching ${keyPattern}`);
    }
};
exports.clearCache = clearCache;
/**
 * Middleware to clear cache when data is modified
 * @param keyPattern Key pattern to clear
 */
const clearCacheMiddleware = (keyPattern) => {
    return (req, res, next) => {
        // Store the original send method
        const originalSend = res.json;
        // Override the json method
        res.json = function (body) {
            // Clear cache after successful operation
            if (res.statusCode >= 200 && res.statusCode < 300) {
                (0, exports.clearCache)(keyPattern);
            }
            // Call the original method
            return originalSend.call(this, body);
        };
        next();
    };
};
exports.clearCacheMiddleware = clearCacheMiddleware;
