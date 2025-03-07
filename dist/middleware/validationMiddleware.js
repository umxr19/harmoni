"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.validate = void 0;
const zod_1 = require("zod");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Middleware to validate request data against a Zod schema
 * @param schema Zod schema to validate against
 * @param source Where to find the data to validate (body, query, params)
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = req[source];
            const validatedData = schema.parse(data);
            // Replace the request data with the validated data
            req[source] = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                logger_1.default.error('Validation error:', error.errors);
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: error.errors.map(err => ({
                        path: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            logger_1.default.error('Unexpected validation error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'An unexpected error occurred during validation'
            });
        }
    };
};
exports.validate = validate;
// Common validation schemas
exports.schemas = {
    // User schemas
    registerUser: zod_1.z.object({
        username: zod_1.z.string().min(3).max(50),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8).max(100),
        role: zod_1.z.enum(['student', 'teacher', 'parent', 'admin']).optional()
    }),
    loginUser: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(1)
    }),
    updateUser: zod_1.z.object({
        username: zod_1.z.string().min(3).max(50).optional(),
        email: zod_1.z.string().email().optional(),
        avatarUrl: zod_1.z.string().url().optional().nullable()
    }),
    changePassword: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1),
        newPassword: zod_1.z.string().min(8).max(100)
    }),
    // Question schemas
    createQuestion: zod_1.z.object({
        text: zod_1.z.string().min(5),
        options: zod_1.z.array(zod_1.z.string()).min(2),
        correctAnswer: zod_1.z.number().int().min(0),
        explanation: zod_1.z.string().optional(),
        category: zod_1.z.string(),
        subcategory: zod_1.z.string().optional(),
        difficulty: zod_1.z.enum(['easy', 'medium', 'hard']),
        tags: zod_1.z.array(zod_1.z.string()).optional()
    }),
    // Exam schemas
    createExam: zod_1.z.object({
        title: zod_1.z.string().min(3).max(100),
        description: zod_1.z.string().optional(),
        questions: zod_1.z.array(zod_1.z.string()).min(1),
        timeLimit: zod_1.z.number().int().positive().optional(),
        difficulty: zod_1.z.enum(['easy', 'medium', 'hard']).optional(),
        isPublic: zod_1.z.boolean().optional()
    }),
    // Practice schemas
    createPracticeSet: zod_1.z.object({
        category: zod_1.z.string().optional(),
        difficulty: zod_1.z.enum(['easy', 'medium', 'hard']).optional(),
        questionCount: zod_1.z.number().int().min(1).max(50).optional()
    }),
    // Classroom schemas
    createClassroom: zod_1.z.object({
        name: zod_1.z.string().min(3).max(100),
        description: zod_1.z.string().optional(),
        students: zod_1.z.array(zod_1.z.string()).optional()
    }),
    // Product schemas
    createProduct: zod_1.z.object({
        title: zod_1.z.string().min(3).max(100),
        description: zod_1.z.string().min(10),
        price: zod_1.z.number().positive(),
        category: zod_1.z.string(),
        subcategory: zod_1.z.string().optional(),
        isFeatured: zod_1.z.boolean().optional(),
        imageUrl: zod_1.z.string().url().optional(),
        fileUrl: zod_1.z.string().url().optional()
    }),
    // Pagination schema
    pagination: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional()
    })
};
