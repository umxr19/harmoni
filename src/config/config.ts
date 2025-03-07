import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: string | 3000;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  openai: {
    apiKey: string;
  };
  cors: {
    origin: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
}

const config: Config = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || ''
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  }
};

export default config; 