import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import logger from "../utils/logger";

/**
 * Middleware to validate request data against a Zod schema
 * @param schema Zod schema to validate against
 * @param source Where to find the data to validate (body, query, params)
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validatedData = schema.parse(data);
      
      // Replace the request data with the validated data
      req[source] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('Validation error:', error.errors);
        
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      logger.error('Unexpected validation error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred during validation'
      });
    }
  };
};

// Common validation schemas
export const schemas = {
  // User schemas
  registerUser: z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    role: z.enum(['student', 'teacher', 'parent', 'admin']).optional()
  }),
  
  loginUser: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  }),
  
  updateUser: z.object({
    username: z.string().min(3).max(50).optional(),
    email: z.string().email().optional(),
    avatarUrl: z.string().url().optional().nullable()
  }),
  
  changePassword: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(100)
  }),
  
  // Question schemas
  createQuestion: z.object({
    text: z.string().min(5),
    options: z.array(z.string()).min(2),
    correctAnswer: z.number().int().min(0),
    explanation: z.string().optional(),
    category: z.string(),
    subcategory: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    tags: z.array(z.string()).optional()
  }),
  
  // Exam schemas
  createExam: z.object({
    title: z.string().min(3).max(100),
    description: z.string().optional(),
    questions: z.array(z.string()).min(1),
    timeLimit: z.number().int().positive().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    isPublic: z.boolean().optional()
  }),
  
  // Practice schemas
  createPracticeSet: z.object({
    category: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    questionCount: z.number().int().min(1).max(50).optional()
  }),
  
  // Classroom schemas
  createClassroom: z.object({
    name: z.string().min(3).max(100),
    description: z.string().optional(),
    students: z.array(z.string()).optional()
  }),
  
  // Product schemas
  createProduct: z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10),
    price: z.number().positive(),
    category: z.string(),
    subcategory: z.string().optional(),
    isFeatured: z.boolean().optional(),
    imageUrl: z.string().url().optional(),
    fileUrl: z.string().url().optional()
  }),
  
  // Pagination schema
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional()
  })
}; 