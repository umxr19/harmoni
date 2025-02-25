import dotenv from 'dotenv';

dotenv.config();

console.log('Environment variables loaded:', {
    MONGODB_URI_exists: !!process.env.MONGODB_URI,
    MONGODB_URI_start: process.env.MONGODB_URI?.substring(0, 20) + '...',
    JWT_SECRET_exists: !!process.env.JWT_SECRET
});

export const databaseConfig = {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/question-bank'
}; 