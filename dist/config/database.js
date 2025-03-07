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
exports.databaseConfig = exports.mongooseOptions = exports.loadEnvVariables = void 0;
exports.testMongoDBConnection = testMongoDBConnection;
exports.getMaskedConnectionString = getMaskedConnectionString;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
// Load environment variables
const loadEnvVariables = () => {
    logger_1.default.info('Environment variables loaded:', {
        MONGODB_URI: process.env.MONGODB_URI ? '[MASKED]' : undefined,
        NODE_ENV: process.env.NODE_ENV
    });
};
exports.loadEnvVariables = loadEnvVariables;
// MongoDB connection options
exports.mongooseOptions = {
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
exports.databaseConfig = {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/question-bank',
    options: exports.mongooseOptions,
    // Fallback to local MongoDB if remote connection fails
    localUri: 'mongodb://localhost:27017/question-bank'
};
// Helper function to test MongoDB connection
function testMongoDBConnection(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.default.info(`Testing connection to: ${uri.split('@')[1]}`); // Log only the host part
            const testConnection = yield mongoose_1.default.createConnection(uri, Object.assign(Object.assign({}, exports.mongooseOptions), { serverSelectionTimeoutMS: 5000 }));
            yield testConnection.close();
            return {
                success: true,
                message: 'Connection test successful'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Unknown connection error'
            };
        }
    });
}
// Export connection string for logging (masking sensitive info)
function getMaskedConnectionString(uri) {
    try {
        const parts = uri.split('@');
        if (parts.length === 2) {
            return `mongodb://<credentials>@${parts[1]}`;
        }
        return 'mongodb://<masked>';
    }
    catch (_a) {
        return 'invalid-connection-string';
    }
}
