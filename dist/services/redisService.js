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
exports.redisService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../utils/logger"));
class RedisService {
    constructor() {
        const redisOptions = {
            retryStrategy: (times) => {
                if (times > 3) {
                    logger_1.default.error('Redis connection failed after 3 retries');
                    return null;
                }
                return Math.min(times * 100, 3000);
            }
        };
        this.client = new ioredis_1.default(config_1.default.redis.url, redisOptions);
        logger_1.default.info('Redis client connecting');
        this.client.on('ready', () => {
            logger_1.default.info('Redis client ready');
        });
        this.client.on('error', (err) => {
            logger_1.default.error('Redis Client Error:', err);
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.get(key);
        });
    }
    set(key, value, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ttl) {
                return yield this.client.setex(key, ttl, value);
            }
            return yield this.client.set(key, value);
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.del(key);
        });
    }
    checkRateLimit(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `ratelimit:${userId}`;
            const limit = 100; // requests per hour
            const current = yield this.client.incr(key);
            if (current === 1) {
                yield this.client.expire(key, 3600); // 1 hour
            }
            if (current > limit) {
                return {
                    allowed: false,
                    error: 'Rate limit exceeded'
                };
            }
            return { allowed: true };
        });
    }
    getRemainingRequests(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const remaining = yield this.client.get(`${key}:remaining`);
            return remaining ? parseInt(remaining, 10) : 0;
        });
    }
    healthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.ping();
                return { status: 'healthy' };
            }
            catch (error) {
                logger_1.default.error('Redis health check failed:', error);
                return { status: 'unhealthy' };
            }
        });
    }
}
exports.redisService = new RedisService();
