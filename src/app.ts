import express from 'express';
import { setRoutes } from './routes/index';
import mongoose from 'mongoose';
import { databaseConfig } from './config/database';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
    console.log('Request received:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    next();
});

// Set up routes
setRoutes(app);

// Database connection
mongoose.connect(databaseConfig.uri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Something broke!' });
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});

const startServer = (portNumber: number) => {
    app.listen(portNumber, () => {
        console.log(`Server running on port ${portNumber}`);
    }).on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${portNumber} is busy, trying ${portNumber + 1}`);
            startServer(portNumber + 1);
        } else {
            console.error('Server error:', err);
        }
    });
};

// Add at the top after imports
console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    hasJwtSecret: !!process.env.JWT_SECRET,
    jwtSecretLength: process.env.JWT_SECRET?.length
});

// Add this logging
console.log('Environment variables loaded:', {
    MONGODB_URI_exists: !!process.env.MONGODB_URI,
    MONGODB_URI_start: process.env.MONGODB_URI?.substring(0, 20) + '...',
    JWT_SECRET_exists: !!process.env.JWT_SECRET,
    JWT_SECRET_value: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN
});

startServer(port);

export default app;