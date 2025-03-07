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
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const redisService_1 = require("../services/redisService");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/debug/ping
 * @desc    Simple ping endpoint to check if the API is reachable
 * @access  Public
 */
router.get('/ping', (req, res) => {
    logger_1.default.info('Ping request received from:', req.ip);
    res.json({
        status: 'ok',
        message: 'API is reachable',
        timestamp: new Date().toISOString(),
        clientIp: req.ip,
        env: process.env.NODE_ENV,
        serverTime: new Date().toISOString()
    });
});
/**
 * @route   GET /api/debug/database
 * @desc    Check database connection status
 * @access  Public
 */
router.get('/database', (req, res) => {
    logger_1.default.info('Database status check from:', req.ip);
    const connectionState = mongoose_1.default.connection.readyState;
    // Map mongoose connection states to human-readable values
    const stateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
        99: 'uninitialized'
    };
    const status = {
        connected: connectionState === 1,
        state: stateMap[connectionState] || 'unknown',
        timestamp: new Date().toISOString(),
        host: mongoose_1.default.connection.host,
        name: mongoose_1.default.connection.name,
        env: process.env.NODE_ENV
    };
    logger_1.default.info('Database status:', status);
    res.json(status);
});
/**
 * @route   GET /api/debug/routes
 * @desc    List all registered routes
 * @access  Public (development only)
 */
router.get('/routes', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Debug routes are disabled in production' });
    }
    const routes = [];
    // Get the Express app from the request
    const app = req.app;
    // Function to extract routes from a layer
    const extractRoutes = (layer, basePath = '') => {
        if (layer.route) {
            // It's a route
            const path = basePath + (layer.route.path || '');
            const methods = Object.keys(layer.route.methods)
                .filter(method => layer.route.methods[method])
                .map(method => method.toUpperCase());
            routes.push({
                path,
                methods,
                middleware: layer.route.stack.map((handler) => handler.name || 'anonymous')
            });
        }
        else if (layer.name === 'router' && layer.handle.stack) {
            // It's a router
            const path = basePath + (layer.regexp.toString().replace(/[^/]*$/, '') || '');
            layer.handle.stack.forEach((stackItem) => {
                extractRoutes(stackItem, path);
            });
        }
    };
    // Extract routes from all layers
    app._router.stack.forEach((layer) => {
        extractRoutes(layer);
    });
    res.json({
        count: routes.length,
        routes: routes.sort((a, b) => a.path.localeCompare(b.path))
    });
});
/**
 * @route   GET /api/debug/auth
 * @desc    Test authentication
 * @access  Private
 */
router.get('/auth', authMiddleware_1.protect, (req, res) => {
    res.json({
        message: 'Authentication successful',
        user: req.user
    });
});
/**
 * @route   GET /api/debug/error/:code
 * @desc    Test error handling with different status codes
 * @access  Public (development only)
 */
router.get('/error/:code', (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Debug routes are disabled in production' });
    }
    const code = parseInt(req.params.code) || 500;
    const error = new Error(`Test error with status code ${code}`);
    error.statusCode = code;
    next(error);
});
/**
 * @route   GET /api/debug/headers
 * @desc    Echo request headers
 * @access  Public (development only)
 */
router.get('/headers', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Debug routes are disabled in production' });
    }
    res.json({
        headers: req.headers,
        method: req.method,
        url: req.url,
        path: req.path,
        query: req.query
    });
});
// Add mobile ping endpoint for testing
router.get('/mobile-ping', (req, res) => {
    res.json({
        success: true,
        message: 'Mobile API connection successful',
        timestamp: new Date().toISOString(),
        headers: req.headers,
        ip: req.ip
    });
});
/**
 * @route   POST /api/debug/test-rate-limit
 * @desc    Test rate limiting without using OpenAI tokens
 * @access  Private
 */
router.post('/test-rate-limit', authMiddleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        // Check rate limit using Redis service
        const rateLimitCheck = yield redisService_1.redisService.checkRateLimit(userId);
        const remainingRequests = yield redisService_1.redisService.getRemainingRequests(userId);
        if (!rateLimitCheck.allowed) {
            return res.status(429).json({
                success: false,
                message: rateLimitCheck.error || 'Rate limit exceeded',
                remainingRequests
            });
        }
        // If we get here, the request is allowed
        res.json({
            success: true,
            message: 'Request allowed',
            remainingRequests
        });
    }
    catch (error) {
        logger_1.default.error('Error in test-rate-limit:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error testing rate limit'
        });
    }
}));
exports.default = router;
