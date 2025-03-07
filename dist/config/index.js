"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Get the absolute path to the .env file
const envPath = path_1.default.resolve(process.cwd(), '.env');
console.log('Looking for .env file at:', envPath);
// Load environment variables
const result = dotenv_1.default.config({ path: envPath });
// Log the raw environment variable before any processing
console.log('Raw OPENAI_API_KEY value:', {
    exists: 'OPENAI_API_KEY' in process.env,
    value: ((_a = process.env.OPENAI_API_KEY) === null || _a === void 0 ? void 0 : _a.substring(0, 7)) + '...' // Only log first 7 chars for security
});
if (result.error) {
    console.error('Error loading .env file:', result.error);
}
// Validate required environment variables
const requiredEnvVars = ['OPENAI_API_KEY', 'JWT_SECRET', 'REDIS_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}
// Since we validate JWT_SECRET and REDIS_URL above, we can safely assert they're defined
const jwtSecret = process.env.JWT_SECRET;
const redisUrl = process.env.REDIS_URL;
const config = {
    port: process.env.PORT || 3000,
    jwt: {
        secret: jwtSecret,
        expiresIn: '24h'
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
    },
    redis: {
        url: process.env.REDIS_URL
    }
};
// Log the final configuration (excluding sensitive data)
console.log('Final OpenAI configuration:', {
    apiKeyExists: !!config.openai.apiKey,
    apiKeyStartsWith: config.openai.apiKey.substring(0, 7),
    apiKeyLength: config.openai.apiKey.length
});
exports.default = config;
