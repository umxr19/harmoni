import OpenAI from 'openai';
import config from '../config/config';
import { redisService } from './redisService';

// Utility functions
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).length;
};

const validateInput = (text: string): { isValid: boolean; error?: string } => {
  if (countWords(text) > 50) {
    return { isValid: false, error: 'Input exceeds 50 words limit' };
  }
  if (text.length > 250) {
    return { isValid: false, error: 'Input exceeds 250 characters limit' };
  }
  return { isValid: true };
};

interface OpenAISuccessResponse {
  success: true;
  response: {
    content: string;
  };
  remainingRequests?: number;
}

interface OpenAIErrorResponse {
  success: false;
  message: string;
  remainingRequests?: number;
}

type OpenAIResponse = OpenAISuccessResponse | OpenAIErrorResponse;

// Log the API key configuration before initializing OpenAI
console.log('OpenAI Service Initialization:', {
  configHasKey: !!config.openai.apiKey,
  keyStartsWith: config.openai.apiKey?.substring(0, 7),
  keyLength: config.openai.apiKey?.length
});

if (!config.openai.apiKey) {
  throw new Error('OpenAI API key is not set in configuration');
}

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// Verify the initialized client
console.log('OpenAI Client Initialized:', {
  hasApiKey: !!openai.apiKey,
  apiKeyStartsWith: openai.apiKey?.substring(0, 7)
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface UserData {
  userId: string;
  moodData: { rating: number; timestamp: Date };
  performance: Array<{ subject: string; score: number }>;
  journalSentiment: { overallSentiment: number; recentMood: string };
  preferences: {
    preferredStudyTime: string;
    preferredRestDay: number;
    maxDailyHours: number;
    focusAreas: string[];
  };
}

class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
  }

  private async makeOpenAIRequest(messages: ChatMessage[], userId: string): Promise<OpenAIResponse> {
    // Check rate limit first
    const rateLimitCheck = await redisService.checkRateLimit(userId);
    const remainingRequests = await redisService.getRemainingRequests(userId);

    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        message: rateLimitCheck.error || 'Rate limit exceeded',
        remainingRequests
      };
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages
      });

      return {
        success: true,
        response: {
          content: completion.choices[0]?.message?.content || ''
        },
        remainingRequests
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        success: false,
        message: 'An error occurred while processing your request. Please try again later.',
        remainingRequests
      };
    }
  }

  async generateChatCompletion(messages: ChatMessage[], role: string = 'user'): Promise<OpenAIResponse> {
    // Validate the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (lastUserMessage) {
      const validation = validateInput(lastUserMessage.content);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.error || 'Invalid input'
        };
      }
    }

    return await this.makeOpenAIRequest(messages, role);
  }

  async generateStudySchedule(userData: UserData): Promise<OpenAIResponse> {
    const prompt = `
      Generate a personalized study schedule based on the following data:
      - Current mood rating: ${userData.moodData.rating}
      - Recent performance: ${JSON.stringify(userData.performance)}
      - Overall sentiment: ${userData.journalSentiment.overallSentiment}
      - Recent mood: ${userData.journalSentiment.recentMood}
      - Preferences: ${JSON.stringify(userData.preferences)}

      Return a JSON object with a 'days' array containing study activities for each day.
      Each day should include topics based on the student's performance and preferences.
    `;

    return this.generateChatCompletion([
      {
        role: 'system',
        content: 'You are a personalized study schedule generator.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);
  }

  async getTutorResponse(question: string, context: string = '', userId: string): Promise<OpenAIResponse> {
    const prompt = `
      As an AI tutor, answer the following question:
      "${question}"
      
      ${context ? `Additional context: ${context}` : ''}
      
      Provide a clear, educational response that helps the student understand the concept.
    `;

    return this.generateChatCompletion([
      {
        role: 'system',
        content: 'You are an educational AI tutor that helps students learn by explaining concepts clearly and providing helpful examples.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);
  }
}

export const openAIService = new OpenAIService(); 