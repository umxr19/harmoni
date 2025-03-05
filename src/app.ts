import express from 'express';
import { setRoutes } from './routes/index';
import mongoose from 'mongoose';
import { databaseConfig } from './config/database';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import logger from './utils/logger';

dotenv.config();

const app = express();

// Global flag to track database connection status
let isDatabaseConnected = false;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend build directory in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

// Debug middleware
app.use((req, res, next) => {
    logger.info('Request received:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    next();
});

// Set up routes
setRoutes(app);

// Add middleware to check database connection
app.use((req, res, next) => {
    // Skip database check for static files and certain endpoints
    if (req.path.startsWith('/api/debug') || req.path.startsWith('/static')) {
        return next();
    }
    
    // If database is not connected, return mock data for GET requests
    if (!isDatabaseConnected && req.method === 'GET') {
        if (req.path.includes('/api/')) {
            logger.info(`Database not connected, returning mock data for ${req.path}`);
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
app.get('/api/debug/database', async (req, res) => {
    try {
        const dbStatus: any = {
            connected: isDatabaseConnected,
            mongooseState: mongoose.connection.readyState,
            stateDescription: getMongooseStateDescription(mongoose.connection.readyState),
            uri: maskConnectionString(databaseConfig.uri),
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
        };
        
        // If not connected, try a test connection
        if (!isDatabaseConnected) {
            try {
                if (mongoose.connection.db) {
                    await mongoose.connection.db.admin().ping();
                    dbStatus.pingTest = 'success';
                } else {
                    dbStatus.pingTest = 'skipped';
                    dbStatus.pingError = 'Database connection not initialized';
                }
            } catch (pingError: any) {
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
    } catch (error: any) {
        res.status(500).json({
            connected: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Catch-all route to serve the frontend in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Helper function to get readable mongoose connection state
function getMongooseStateDescription(state: number): string {
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
function maskConnectionString(uri: string): string {
    if (!uri) return 'not set';
    const parts = uri.split('@');
    if (parts.length === 2) {
        return `mongodb://****:****@${parts[1]}`;
    }
    return uri;
}

// Helper function to get mock data based on path
function getMockData(path: string): any {
    const mockData: { [key: string]: any } = {
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

// Database connection with fallback
const connectToDatabase = async () => {
    try {
        logger.info('Attempting to connect to MongoDB Atlas...');
        logger.info('Using connection string:', maskConnectionString(databaseConfig.uri));
        
        // Try connecting to the primary MongoDB URI with increased timeout
        const options = {
            ...databaseConfig.options,
            serverSelectionTimeoutMS: 20000, // Increase timeout to 20 seconds
        };
        
        await mongoose.connect(databaseConfig.uri, options);
        logger.info('Connected to MongoDB Atlas successfully');
        isDatabaseConnected = true;
        return true;
    } catch (error: any) {
        logger.error('MongoDB Atlas connection error:', error.name);
        logger.error('Error message:', error.message);
        
        if (error.name === 'MongoServerSelectionError') {
            logger.error('Server selection timed out. This could be due to:');
            logger.error('1. Network connectivity issues');
            logger.error('2. IP address not whitelisted in MongoDB Atlas');
            logger.error('3. Invalid connection string');
            
            // Try to get more detailed error information
            if (error.reason) {
                logger.error('Reason:', error.reason.toString());
            }
        }
        
        // If primary connection fails, try connecting to local MongoDB
        try {
            logger.info('Attempting to connect to local MongoDB...');
            await mongoose.connect(databaseConfig.localUri, databaseConfig.options);
            logger.info('Connected to local MongoDB successfully');
            isDatabaseConnected = true;
            return true;
        } catch (localError: any) {
            logger.error('Local MongoDB connection error:', localError.name);
            logger.error('Error message:', localError.message);
            logger.info('Running in memory mode - data will not be persisted');
            // Continue running the app even without database
            isDatabaseConnected = false;
            return false;
        }
    }
};

// Modified to use async/await for database connection
const startServer = async (portNumber: number, maxAttempts = 10) => {
    if (maxAttempts <= 0) {
        logger.error('Could not find an available port after multiple attempts');
        process.exit(1);
    }

    try {
        // Connect to database before starting server
        await connectToDatabase();

        // Start the server
        const server = app.listen(portNumber, () => {
            logger.info(`Server running on port ${portNumber}`);
            logger.info(`Database connected: ${isDatabaseConnected}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Handle server errors
        server.on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
                logger.info(`Port ${portNumber} is busy, trying ${portNumber + 1}`);
                server.close();
                startServer(portNumber + 1, maxAttempts - 1);
            } else {
                logger.error('Server error:', err);
                process.exit(1);
            }
        });

        // Handle process termination
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                logger.info('Server closed');
                mongoose.connection.close().then(() => {
                    logger.info('Database connection closed');
                    process.exit(0);
                });
            });
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Use the PORT from environment variables or default to 3000
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Start the server
startServer(port);

// Add at the top after imports
logger.info('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    hasJwtSecret: !!process.env.JWT_SECRET,
    jwtSecretLength: process.env.JWT_SECRET?.length
});

// Add this logging
logger.info('Environment variables loaded:', {
    MONGODB_URI_exists: !!process.env.MONGODB_URI,
    MONGODB_URI_start: process.env.MONGODB_URI?.substring(0, 20) + '...',
    JWT_SECRET_exists: !!process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN
});

export default app;