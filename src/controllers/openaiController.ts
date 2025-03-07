import { Request, Response } from 'express';
import { openAIService } from '../services/openaiService';

interface User {
  id: string;
  role: string;
  username: string;
}

interface ChatCompletionMessage {
  role: string;
  content: string;
  refusal?: boolean;
}

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

export const openaiController = {
  async generateStudySchedule(preferences: any, user: User): Promise<ChatCompletionMessage> {
    try {
      const userData = {
        userId: user.id,
        moodData: { rating: 3, timestamp: new Date() },
        performance: [],
        journalSentiment: {
          overallSentiment: 0,
          recentMood: 'neutral'
        },
        preferences: {
          preferredStudyTime: preferences?.preferredStudyTime || 'evening',
          preferredRestDay: preferences?.preferredRestDay || 0,
          maxDailyHours: preferences?.maxDailyHours || 3,
          focusAreas: preferences?.focusAreas || []
        }
      };
      
      const response = await openAIService.generateStudySchedule(userData);
      if (!response.success) {
        throw new Error(response.message);
      }
      
      return {
        role: 'assistant',
        content: response.response?.content || ''
      };
    } catch (error) {
      console.error('Error in generateStudySchedule:', error);
      throw error;
    }
  },

  async getTutorResponse(question: string, context: string = '', userId: string): Promise<ChatCompletionMessage> {
    try {
      const response = await openAIService.getTutorResponse(question, context, userId);
      if (!response.success) {
        throw new Error(response.message);
      }
      
      return {
        role: 'assistant',
        content: response.response?.content || ''
      };
    } catch (error) {
      console.error('Error in getTutorResponse:', error);
      throw error;
    }
  }
}; 