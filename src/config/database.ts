import mongoose from 'mongoose';
import logger from "../utils/logger";

// Load environment variables
export const loadEnvVariables = () => {
  logger.info('Environment variables loaded:', {
    MONGODB_URI: process.env.MONGODB_URI ? '[MASKED]' : undefined,
    NODE_ENV: process.env.NODE_ENV
  });
};

// MongoDB connection options
export const mongooseOptions: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 15000, // Increase timeout to 15 seconds (from 5)
    socketTimeoutMS: 60000, // Increase socket timeout to 60 seconds (from 45)
    family: 4, // Use IPv4, skip trying IPv6
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 10,
    minPoolSize: 1,
    connectTimeoutMS: 30000, // 30 seconds connection timeout
};

// Use local MongoDB for development if remote connection fails
export const databaseConfig = {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/question-bank',
    options: mongooseOptions,
    // Fallback to local MongoDB if remote connection fails
    localUri: 'mongodb://localhost:27017/question-bank'
};

// Helper function to test MongoDB connection
export async function testMongoDBConnection(uri: string): Promise<{ success: boolean; message: string }> {
    try {
        const testConnection = await mongoose.createConnection(uri, {
            ...mongooseOptions,
            serverSelectionTimeoutMS: 5000, // Short timeout for quick test
        });
        
        await testConnection.close();
        return { 
            success: true, 
            message: 'Connection test successful' 
        };
    } catch (error: any) {
        return { 
            success: false, 
            message: error.message || 'Unknown connection error' 
        };
    }
} 