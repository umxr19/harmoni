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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("./routes/index");
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("./config/database");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./utils/logger"));
const openaiRoutes_1 = __importDefault(require("./routes/openaiRoutes"));
const config_1 = __importDefault(require("./config"));
const activityRoutes_1 = __importDefault(require("./routes/activityRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Global flag to track database connection status
let isDatabaseConnected = false;
// Middleware setup
app.use((0, cors_1.default)({
    origin: config_1.default.cors.origin,
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from the frontend build directory in production
if (process.env.NODE_ENV === 'production') {
    app.use(express_1.default.static(path_1.default.join(__dirname, '../frontend/dist')));
}
// Debug middleware
app.use((req, res, next) => {
    logger_1.default.info('Request received:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    next();
});
// Set up routes
(0, index_1.setRoutes)(app);
// Register OpenAI routes
app.use('/api/openai', openaiRoutes_1.default);
// Add middleware to check database connection
app.use((req, res, next) => {
    // Skip database check for static files and certain endpoints
    if (req.path.startsWith('/api/debug') || req.path.startsWith('/static')) {
        return next();
    }
    // If database is not connected, return mock data for GET requests
    if (!isDatabaseConnected && req.method === 'GET') {
        if (req.path.includes('/api/')) {
            logger_1.default.info(`Database not connected, returning mock data for ${req.path}`);
            return res.status(200).json({
                success: true,
                message: 'Mock data (database not connected)',
                data: getMockData(req.path)
            });
        }
    }
    next();
});
// Add debug endpoint for database connection status
app.get('/api/debug/database', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbStatus = {
            connected: isDatabaseConnected,
            mongooseState: mongoose_1.default.connection.readyState,
            stateDescription: getMongooseStateDescription(mongoose_1.default.connection.readyState),
            uri: maskConnectionString(database_1.databaseConfig.uri),
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
        };
        // If not connected, try a test connection
        if (!isDatabaseConnected) {
            try {
                if (mongoose_1.default.connection.db) {
                    yield mongoose_1.default.connection.db.admin().ping();
                    dbStatus.pingTest = 'success';
                }
                else {
                    dbStatus.pingTest = 'skipped';
                    dbStatus.pingError = 'Database connection not initialized';
                }
            }
            catch (pingError) {
                dbStatus.pingTest = 'failed';
                dbStatus.pingError = pingError.message;
                // Try to get more detailed error information
                if (pingError.name === 'MongoServerSelectionError') {
                    dbStatus.detailedError = {
                        name: pingError.name,
                        message: pingError.message,
                        reason: pingError.reason ? pingError.reason.toString() : 'Unknown',
                        topology: pingError.topology ? 'Available' : 'Not available'
                    };
                }
            }
        }
        res.status(200).json(dbStatus);
    }
    catch (error) {
        res.status(500).json({
            connected: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}));
// Catch-all route to serve the frontend in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../frontend/dist/index.html'));
    });
}
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.default.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Helper function to get readable mongoose connection state
function getMongooseStateDescription(state) {
    switch (state) {
        case 0: return 'disconnected';
        case 1: return 'connected';
        case 2: return 'connecting';
        case 3: return 'disconnecting';
        case 99: return 'uninitialized';
        default: return 'unknown';
    }
}
// Helper function to mask sensitive information in connection string
function maskConnectionString(uri) {
    if (!uri)
        return 'not set';
    const parts = uri.split('@');
    if (parts.length === 2) {
        return `mongodb://****:****@${parts[1]}`;
    }
    return uri;
}
// Helper function to get mock data based on path
function getMockData(path) {
    const mockData = {
        '/api/classrooms/student': {
            classrooms: [
                {
                    _id: 'mock-classroom-1',
                    name: 'Mock Classroom 1',
                    description: 'A mock classroom for testing',
                    teacherId: 'mock-teacher-1',
                    teacherName: 'Mock Teacher'
                }
            ]
        },
        '/api/analytics/student/current': {
            analytics: {
                totalQuestions: 100,
                correctAnswers: 75,
                averageScore: 75,
                recentActivity: []
            }
        }
    };
    return mockData[path] || { message: 'No mock data available for this endpoint' };
}
// Database connection with proper error handling
const connectToDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info('Attempting to connect to MongoDB Atlas...');
        logger_1.default.info('Using connection string:', (0, database_1.getMaskedConnectionString)(database_1.databaseConfig.uri));
        // Try connecting to MongoDB Atlas
        yield mongoose_1.default.connect(database_1.databaseConfig.uri, database_1.databaseConfig.options);
        logger_1.default.info('Connected to MongoDB Atlas successfully');
        isDatabaseConnected = true;
        return true;
    }
    catch (error) {
        logger_1.default.error('MongoDB Atlas connection error:', error.name);
        logger_1.default.error('Error message:', error.message);
        if (error.name === 'MongoServerSelectionError') {
            logger_1.default.error('Server selection timed out. This could be due to:');
            logger_1.default.error('1. Network connectivity issues');
            logger_1.default.error('2. IP address not whitelisted in MongoDB Atlas');
            logger_1.default.error('3. Invalid connection string');
            if (error.reason) {
                logger_1.default.error('Reason:', error.reason.toString());
            }
        }
        // If Atlas connection fails, try connecting to local MongoDB
        try {
            logger_1.default.info('Attempting to connect to local MongoDB...');
            yield mongoose_1.default.connect(database_1.databaseConfig.localUri, database_1.databaseConfig.options);
            logger_1.default.info('Connected to local MongoDB successfully');
            isDatabaseConnected = true;
            return true;
        }
        catch (localError) {
            logger_1.default.error('Local MongoDB connection error:', localError.name);
            logger_1.default.error('Error message:', localError.message);
            logger_1.default.info('Running in memory mode - data will not be persisted');
            isDatabaseConnected = false;
            return false;
        }
    }
});
// Modified to use async/await for database connection
const startServer = (portNumber_1, ...args_1) => __awaiter(void 0, [portNumber_1, ...args_1], void 0, function* (portNumber, maxAttempts = 10) {
    if (maxAttempts <= 0) {
        logger_1.default.error('Could not find an available port after multiple attempts');
        process.exit(1);
    }
    try {
        // Connect to database before starting server
        yield connectToDatabase();
        // Start the server
        const server = app.listen(portNumber, () => {
            logger_1.default.info(`Server running on port ${portNumber}`);
            logger_1.default.info(`Database connected: ${isDatabaseConnected}`);
            logger_1.default.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
        // Handle server errors
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger_1.default.info(`Port ${portNumber} is busy, trying ${portNumber + 1}`);
                server.close();
                startServer(portNumber + 1, maxAttempts - 1);
            }
            else {
                logger_1.default.error('Server error:', err);
                process.exit(1);
            }
        });
        // Handle process termination
        process.on('SIGTERM', () => {
            logger_1.default.info('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                logger_1.default.info('Server closed');
                mongoose_1.default.connection.close().then(() => {
                    logger_1.default.info('Database connection closed');
                    process.exit(0);
                });
            });
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
});
// Use the PORT from environment variables or default to 3000
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
// Start the server
startServer(port);
// Add at the top after imports
logger_1.default.info('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    hasJwtSecret: !!process.env.JWT_SECRET,
    jwtSecretLength: (_a = process.env.JWT_SECRET) === null || _a === void 0 ? void 0 : _a.length
});
// Add this logging
logger_1.default.info('Environment variables loaded:', {
    MONGODB_URI_exists: !!process.env.MONGODB_URI,
    MONGODB_URI_start: ((_b = process.env.MONGODB_URI) === null || _b === void 0 ? void 0 : _b.substring(0, 20)) + '...',
    JWT_SECRET_exists: !!process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN
});
// Routes
app.use('/api/activities', activityRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api', healthRoutes_1.default);
exports.default = app;
