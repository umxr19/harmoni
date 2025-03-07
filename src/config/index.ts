import dotenv from 'dotenv';
import path from 'path';

// Get the absolute path to the .env file
const envPath = path.resolve(process.cwd(), '.env');
console.log('Looking for .env file at:', envPath);

// Load environment variables
const result = dotenv.config({ path: envPath });

// Log the raw environment variable before any processing
console.log('Raw OPENAI_API_KEY value:', {
  exists: 'OPENAI_API_KEY' in process.env,
  value: process.env.OPENAI_API_KEY?.substring(0, 7) + '...' // Only log first 7 chars for security
});

if (result.error) {
  console.error('Error loading .env file:', result.error);
}

// Validate required environment variables
const requiredEnvVars = ['OPENAI_API_KEY', 'JWT_SECRET', 'REDIS_URL'] as const;
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Since we validate JWT_SECRET and REDIS_URL above, we can safely assert they're defined
const jwtSecret = process.env.JWT_SECRET as string;
const redisUrl = process.env.REDIS_URL as string;

interface Config {
  readonly port: string | 3000;
  readonly jwt: {
    readonly secret: string;
    readonly expiresIn: string;
  };
  readonly openai: {
    readonly apiKey: string;
  };
  readonly cors: {
    readonly origin: string;
  };
  readonly redis: {
    readonly url: string;
  };
}

const config: Config = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: jwtSecret,
    expiresIn: '24h'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY as string
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },
  redis: {
    url: process.env.REDIS_URL as string
  }
};

// Log the final configuration (excluding sensitive data)
console.log('Final OpenAI configuration:', {
  apiKeyExists: !!config.openai.apiKey,
  apiKeyStartsWith: config.openai.apiKey.substring(0, 7),
  apiKeyLength: config.openai.apiKey.length
});

export default config; 