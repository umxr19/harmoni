import mongoose from 'mongoose';
import logger from "../utils/logger";
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Load environment variables
export const loadEnvVariables = () => {
  logger.info('Environment variables loaded:', {
    MONGODB_URI: process.env.MONGODB_URI ? '[MASKED]' : undefined,
    NODE_ENV: process.env.NODE_ENV
  });
};

// MongoDB connection options
export const mongooseOptions: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 60000,
    family: 4,
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 10,
    minPoolSize: 1,
    connectTimeoutMS: 30000,
};

// Database configuration
export const databaseConfig = {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/question-bank',
    options: mongooseOptions,
    // Fallback to local MongoDB if remote connection fails
    localUri: 'mongodb://localhost:27017/question-bank'
};

// Helper function to test MongoDB connection
export async function testMongoDBConnection(uri: string): Promise<{ success: boolean; message: string }> {
    try {
        logger.info(`Testing connection to: ${uri.split('@')[1]}`); // Log only the host part
        const testConnection = await mongoose.createConnection(uri, {
            ...mongooseOptions,
            serverSelectionTimeoutMS: 5000,
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

// Export connection string for logging (masking sensitive info)
export function getMaskedConnectionString(uri: string): string {
    try {
        const parts = uri.split('@');
        if (parts.length === 2) {
            return `mongodb://<credentials>@${parts[1]}`;
        }
        return 'mongodb://<masked>';
    } catch {
        return 'invalid-connection-string';
    }
} 