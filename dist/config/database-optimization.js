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
exports.createIndexes = createIndexes;
exports.paginateResults = paginateResults;
exports.initDatabaseOptimizations = initDatabaseOptimizations;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Creates indexes for frequently queried fields to improve database performance
 */
function createIndexes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // User model indexes
            yield mongoose_1.default.model('User').createIndexes();
            logger_1.default.info('Created indexes for User model');
            // Question model indexes
            yield mongoose_1.default.model('Question').collection.createIndex({ category: 1 });
            yield mongoose_1.default.model('Question').collection.createIndex({ difficulty: 1 });
            yield mongoose_1.default.model('Question').collection.createIndex({ tags: 1 });
            logger_1.default.info('Created indexes for Question model');
            // Attempt model indexes
            yield mongoose_1.default.model('Attempt').collection.createIndex({ userId: 1 });
            yield mongoose_1.default.model('Attempt').collection.createIndex({ questionId: 1 });
            yield mongoose_1.default.model('Attempt').collection.createIndex({ createdAt: -1 });
            logger_1.default.info('Created indexes for Attempt model');
            // Exam model indexes
            yield mongoose_1.default.model('Exam').collection.createIndex({ isPublic: 1 });
            yield mongoose_1.default.model('Exam').collection.createIndex({ creatorId: 1 });
            yield mongoose_1.default.model('Exam').collection.createIndex({ difficulty: 1 });
            logger_1.default.info('Created indexes for Exam model');
            // Classroom model indexes
            yield mongoose_1.default.model('Classroom').collection.createIndex({ teacherId: 1 });
            yield mongoose_1.default.model('Classroom').collection.createIndex({ 'students': 1 });
            logger_1.default.info('Created indexes for Classroom model');
            // Product model indexes
            yield mongoose_1.default.model('Product').collection.createIndex({ category: 1 });
            yield mongoose_1.default.model('Product').collection.createIndex({ isFeatured: 1 });
            yield mongoose_1.default.model('Product').collection.createIndex({ creatorId: 1 });
            logger_1.default.info('Created indexes for Product model');
            // Purchase model indexes
            yield mongoose_1.default.model('Purchase').collection.createIndex({ userId: 1 });
            yield mongoose_1.default.model('Purchase').collection.createIndex({ productId: 1 });
            yield mongoose_1.default.model('Purchase').collection.createIndex({ purchaseDate: -1 });
            logger_1.default.info('Created indexes for Purchase model');
            // StudySchedule model indexes
            yield mongoose_1.default.model('StudySchedule').collection.createIndex({ userId: 1 });
            yield mongoose_1.default.model('StudySchedule').collection.createIndex({ weekNumber: 1 });
            logger_1.default.info('Created indexes for StudySchedule model');
            logger_1.default.info('All database indexes created successfully');
        }
        catch (error) {
            logger_1.default.error('Error creating database indexes:', error);
            throw error;
        }
    });
}
/**
 * Implements pagination for database queries
 * @param model Mongoose model
 * @param query Query object
 * @param page Page number (1-based)
 * @param limit Items per page
 * @param sort Sort options
 * @param populate Fields to populate
 * @returns Paginated results with metadata
 */
function paginateResults(model_1) {
    return __awaiter(this, arguments, void 0, function* (model, query = {}, page = 1, limit = 10, sort = { createdAt: -1 }, populate = []) {
        try {
            const skip = (page - 1) * limit;
            // Count total documents matching the query
            const totalDocs = yield model.countDocuments(query);
            // Build the query
            let queryBuilder = model.find(query).sort(sort).skip(skip).limit(limit);
            // Add population if specified
            if (populate) {
                if (Array.isArray(populate)) {
                    populate.forEach(field => {
                        queryBuilder = queryBuilder.populate(field);
                    });
                }
                else {
                    queryBuilder = queryBuilder.populate(populate);
                }
            }
            // Execute the query
            const results = yield queryBuilder.exec();
            // Calculate pagination metadata
            const totalPages = Math.ceil(totalDocs / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;
            return {
                results,
                pagination: {
                    totalDocs,
                    limit,
                    page,
                    totalPages,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? page + 1 : null,
                    prevPage: hasPrevPage ? page - 1 : null
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error in paginateResults:', error);
            throw error;
        }
    });
}
/**
 * Initialize database optimizations
 */
function initDatabaseOptimizations() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Create indexes for frequently queried fields
            yield createIndexes();
            logger_1.default.info('Database optimizations initialized successfully');
        }
        catch (error) {
            logger_1.default.error('Error initializing database optimizations:', error);
        }
    });
}
