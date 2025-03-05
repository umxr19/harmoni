import mongoose from 'mongoose';
import logger from "../utils/logger";

/**
 * Creates indexes for frequently queried fields to improve database performance
 */
export async function createIndexes() {
  try {
    // User model indexes
    await mongoose.model('User').createIndexes();
    logger.info('Created indexes for User model');

    // Question model indexes
    await mongoose.model('Question').collection.createIndex({ category: 1 });
    await mongoose.model('Question').collection.createIndex({ difficulty: 1 });
    await mongoose.model('Question').collection.createIndex({ tags: 1 });
    logger.info('Created indexes for Question model');

    // Attempt model indexes
    await mongoose.model('Attempt').collection.createIndex({ userId: 1 });
    await mongoose.model('Attempt').collection.createIndex({ questionId: 1 });
    await mongoose.model('Attempt').collection.createIndex({ createdAt: -1 });
    logger.info('Created indexes for Attempt model');

    // Exam model indexes
    await mongoose.model('Exam').collection.createIndex({ isPublic: 1 });
    await mongoose.model('Exam').collection.createIndex({ creatorId: 1 });
    await mongoose.model('Exam').collection.createIndex({ difficulty: 1 });
    logger.info('Created indexes for Exam model');

    // Classroom model indexes
    await mongoose.model('Classroom').collection.createIndex({ teacherId: 1 });
    await mongoose.model('Classroom').collection.createIndex({ 'students': 1 });
    logger.info('Created indexes for Classroom model');

    // Product model indexes
    await mongoose.model('Product').collection.createIndex({ category: 1 });
    await mongoose.model('Product').collection.createIndex({ isFeatured: 1 });
    await mongoose.model('Product').collection.createIndex({ creatorId: 1 });
    logger.info('Created indexes for Product model');

    // Purchase model indexes
    await mongoose.model('Purchase').collection.createIndex({ userId: 1 });
    await mongoose.model('Purchase').collection.createIndex({ productId: 1 });
    await mongoose.model('Purchase').collection.createIndex({ purchaseDate: -1 });
    logger.info('Created indexes for Purchase model');

    // StudySchedule model indexes
    await mongoose.model('StudySchedule').collection.createIndex({ userId: 1 });
    await mongoose.model('StudySchedule').collection.createIndex({ weekNumber: 1 });
    logger.info('Created indexes for StudySchedule model');

    logger.info('All database indexes created successfully');
  } catch (error) {
    logger.error('Error creating database indexes:', error);
    throw error;
  }
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
export async function paginateResults(
  model: mongoose.Model<any>,
  query: any = {},
  page: number = 1,
  limit: number = 10,
  sort: any = { createdAt: -1 },
  populate: string | string[] = []
) {
  try {
    const skip = (page - 1) * limit;
    
    // Count total documents matching the query
    const totalDocs = await model.countDocuments(query);
    
    // Build the query
    let queryBuilder = model.find(query).sort(sort).skip(skip).limit(limit);
    
    // Add population if specified
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(field => {
          queryBuilder = queryBuilder.populate(field);
        });
      } else {
        queryBuilder = queryBuilder.populate(populate);
      }
    }
    
    // Execute the query
    const results = await queryBuilder.exec();
    
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
  } catch (error) {
    logger.error('Error in paginateResults:', error);
    throw error;
  }
}

/**
 * Initialize database optimizations
 */
export async function initDatabaseOptimizations() {
  try {
    // Create indexes for frequently queried fields
    await createIndexes();
    
    logger.info('Database optimizations initialized successfully');
  } catch (error) {
    logger.error('Error initializing database optimizations:', error);
  }
} 