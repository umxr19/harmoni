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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.openAIService = exports.OpenAIService = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = __importDefault(require("../config"));
const redisService_1 = require("./redisService");
// Utility functions
const countWords = (text) => {
    return text.trim().split(/\s+/).length;
};
const validateInput = (text) => {
    if (countWords(text) > 50) {
        return { isValid: false, error: 'Input exceeds 50 words limit' };
    }
    if (text.length > 250) {
        return { isValid: false, error: 'Input exceeds 250 characters limit' };
    }
    return { isValid: true };
};
// Log the API key configuration before initializing OpenAI
console.log('OpenAI Service Initialization:', {
    configHasKey: !!config_1.default.openai.apiKey,
    keyStartsWith: (_a = config_1.default.openai.apiKey) === null || _a === void 0 ? void 0 : _a.substring(0, 7),
    keyLength: (_b = config_1.default.openai.apiKey) === null || _b === void 0 ? void 0 : _b.length
});
if (!config_1.default.openai.apiKey) {
    throw new Error('OpenAI API key is not set in configuration');
}
const openai = new openai_1.default({
    apiKey: config_1.default.openai.apiKey,
});
// Verify the initialized client
console.log('OpenAI Client Initialized:', {
    hasApiKey: !!openai.apiKey,
    apiKeyStartsWith: (_c = openai.apiKey) === null || _c === void 0 ? void 0 : _c.substring(0, 7)
});
class OpenAIService {
    makeOpenAIRequest(messages, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check rate limit first
            const rateLimitCheck = yield redisService_1.redisService.checkRateLimit(userId);
            const remainingRequests = yield redisService_1.redisService.getRemainingRequests(userId);
            if (!rateLimitCheck.allowed) {
                return {
                    success: false,
                    message: rateLimitCheck.error || 'Rate limit exceeded',
                    remainingRequests
                };
            }
            try {
                const completion = yield openai.chat.completions.create({
                    model: "gpt-4",
                    messages: messages,
                    max_tokens: 100,
                    temperature: 0.7,
                });
                return {
                    success: true,
                    response: completion.choices[0].message,
                    remainingRequests
                };
            }
            catch (error) {
                console.error('OpenAI API Error:', error);
                return {
                    success: false,
                    message: 'An error occurred while processing your request. Please try again later.',
                    remainingRequests
                };
            }
        });
    }
    generateChatCompletion(messages, userId) {
        return __awaiter(this, void 0, void 0, function* () {
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
            return yield this.makeOpenAIRequest(messages, userId);
        });
    }
    generateStudySchedule(userPreferences, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const systemPrompt = `You are an expert educational planner creating personalized study schedules.
Your task is to analyze student data and generate an adaptive weekly schedule that:
1. Prioritizes subjects based on performance scores
2. Adjusts difficulty based on mood and journal sentiment
3. Includes motivational messages tailored to the student's emotional state
4. Respects preferred study times and break days
5. Ensures proper spacing between subjects

Return the schedule in this exact JSON format:
{
  "Monday": { "subject": "subject_name", "duration": "XX mins", "focus": "specific_topic", "motivation": "message", "difficulty": "easy|medium|hard" },
  ... (for each weekday)
}`;
            const userPrompt = `Create a personalized study schedule based on this student data:
${JSON.stringify(userPreferences, null, 2)}

Consider:
- Prioritize subjects with lower performance scores
- If mood is declining, reduce difficulty and add encouraging messages
- If journal sentiment is negative, include more breaks and positive reinforcement
- Schedule more challenging subjects during preferred study times
- Include rest days based on last study date

Respond ONLY with the JSON schedule object.`;
            return yield this.makeOpenAIRequest([
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ], user.id);
        });
    }
    getTutorResponse(question_1) {
        return __awaiter(this, arguments, void 0, function* (question, context = '', userId) {
            // Validate input
            const validation = validateInput(question);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: validation.error || 'Invalid input'
                };
            }
            return yield this.makeOpenAIRequest([
                {
                    role: 'system',
                    content: 'You are a helpful tutor assisting students with their questions.'
                },
                {
                    role: 'user',
                    content: `Context: ${context}\nQuestion: ${question}`
                }
            ], userId);
        });
    }
}
exports.OpenAIService = OpenAIService;
exports.openAIService = new OpenAIService();
