import Attempt, { IAttempt } from '../models/attempt';
import Question from '../models/question';
import mongoose from 'mongoose';
import logger from '../utils/logger';

export default class AttemptService {
    async submitAttempt(data: {
        userId: string;
        questionId: string;
        selectedOption: string;
        timeSpent: number;
    }) {
        // Get the question to check if answer is correct
        const question = await Question.findById(data.questionId);
        if (!question) {
            throw new Error('Question not found');
        }

        // Check if the selected option is correct
        const correctOption = question.options.find((opt: any) => opt.isCorrect);
        const isCorrect = correctOption?.text === data.selectedOption;

        // Create the attempt
        const attempt = new Attempt({
            user: data.userId,
            question: data.questionId,
            selectedOption: data.selectedOption,
            isCorrect,
            timeSpent: data.timeSpent
        });

        await attempt.save();
        return attempt;
    }

    async getUserStats(userId: string) {
        // Basic stats
        const attempts = await Attempt.find({ user: userId });
        const correctAttempts = attempts.filter(a => a.isCorrect);
        
        // Get category-specific stats
        const categoryStats = await this.getUserCategoryStats(userId);
        
        // Get recent activity
        const recentActivity = await this.getUserRecentActivity(userId);
        
        return {
            totalAttempts: attempts.length,
            correctAnswers: correctAttempts.length,
            accuracy: attempts.length > 0 ? (correctAttempts.length / attempts.length) * 100 : 0,
            averageTime: attempts.length > 0 ? 
                attempts.reduce((acc, curr) => acc + curr.timeSpent, 0) / attempts.length : 0,
            categoryStats,
            recentActivity
        };
    }
    
    async getUserCategoryStats(userId: string) {
        const categoryStats = await Attempt.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'questions',
                    localField: 'question',
                    foreignField: '_id',
                    as: 'questionData'
                }
            },
            { $unwind: '$questionData' },
            { $unwind: '$questionData.category' },
            {
                $group: {
                    _id: '$questionData.category',
                    totalAttempts: { $sum: 1 },
                    correctAttempts: { 
                        $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] } 
                    }
                }
            },
            {
                $project: {
                    category: '$_id',
                    totalAttempts: 1,
                    correctAttempts: 1,
                    accuracy: { 
                        $multiply: [
                            { $divide: ['$correctAttempts', '$totalAttempts'] },
                            100
                        ]
                    }
                }
            },
            { $sort: { category: 1 } }
        ]);
        
        return categoryStats;
    }
    
    async getUserRecentActivity(userId: string, limit: number = 10) {
        const recentAttempts = await Attempt.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('question', 'title content');
            
        return recentAttempts.map(attempt => {
            // Use type assertion to tell TypeScript that question is populated
            const question = attempt.question as unknown as { 
                _id: string; 
                title: string; 
                content: string 
            };
            
            return {
                date: attempt.createdAt,
                questionId: question._id,
                questionTitle: question.title,
                action: `Answered "${question.title}"`,
                result: attempt.isCorrect ? 'Correct' : 'Incorrect',
                selectedOption: attempt.selectedOption,
                timeSpent: attempt.timeSpent
            };
        });
    }
    
    async getRecommendedQuestions(userId: string) {
        // Find categories where user has lower accuracy
        const categoryStats = await this.getUserCategoryStats(userId);
        
        // Sort by lowest accuracy
        const weakestCategories = [...categoryStats].sort((a, b) => a.accuracy - b.accuracy);
        
        // Get top 2 weakest categories
        const categoriesToImprove = weakestCategories
            .slice(0, 2)
            .map(cat => cat.category);
            
        // Find questions in those categories that the user hasn't attempted yet
        const attemptedQuestionIds = (await Attempt.find({ user: userId }))
            .map(attempt => attempt.question.toString());
            
        const recommendedQuestions = await Question.find({
            category: { $in: categoriesToImprove },
            _id: { $nin: attemptedQuestionIds }
        })
        .limit(5)
        .select('_id title content category difficulty');
        
        return {
            weakCategories: categoriesToImprove,
            recommendedQuestions
        };
    }

    async getQuestionStats(questionId: string) {
        const attempts = await Attempt.find({ question: questionId });
        
        return {
            totalAttempts: attempts.length,
            correctAnswers: attempts.filter(a => a.isCorrect).length,
            averageTime: attempts.reduce((acc, curr) => acc + curr.timeSpent, 0) / attempts.length || 0,
            accuracy: (attempts.filter(a => a.isCorrect).length / attempts.length) * 100 || 0
        };
    }

    async getLeaderboard(options: {
        timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
        category?: string;
        limit?: number;
    }) {
        try {
            const { timeframe = 'all-time', category, limit = 10 } = options;
            
            // Build date filter
            const dateFilter: any = {};
            if (timeframe !== 'all-time') {
                const now = new Date();
                switch (timeframe) {
                    case 'daily':
                        now.setHours(0, 0, 0, 0);
                        dateFilter.createdAt = { $gte: now };
                        break;
                    case 'weekly':
                        now.setDate(now.getDate() - 7);
                        dateFilter.createdAt = { $gte: now };
                        break;
                    case 'monthly':
                        now.setMonth(now.getMonth() - 1);
                        dateFilter.createdAt = { $gte: now };
                        break;
                }
            }

            // Build category filter
            const categoryFilter = category ? {
                'question.category': category
            } : {};

            const leaderboard = await Attempt.aggregate([
                {
                    $match: {
                        ...dateFilter,
                        ...categoryFilter
                    }
                },
                {
                    $lookup: {
                        from: 'questions',
                        localField: 'question',
                        foreignField: '_id',
                        as: 'question'
                    }
                },
                {
                    $unwind: '$question'
                },
                {
                    $group: {
                        _id: '$user',
                        totalAttempts: { $sum: 1 },
                        correctAnswers: {
                            $sum: { $cond: ['$isCorrect', 1, 0] }
                        },
                        averageTime: { $avg: '$timeSpent' },
                        score: {
                            $sum: {
                                $cond: [
                                    '$isCorrect',
                                    { 
                                        $multiply: [
                                            10,
                                            { 
                                                $switch: {
                                                    branches: [
                                                        { case: { $eq: ['$question.difficulty', 'easy'] }, then: 1 },
                                                        { case: { $eq: ['$question.difficulty', 'medium'] }, then: 2 },
                                                        { case: { $eq: ['$question.difficulty', 'hard'] }, then: 3 }
                                                    ],
                                                    default: 1
                                                }
                                            }
                                        ]
                                    },
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $project: {
                        username: '$user.username',
                        totalAttempts: 1,
                        correctAnswers: 1,
                        accuracy: {
                            $multiply: [
                                { $divide: ['$correctAnswers', '$totalAttempts'] },
                                100
                            ]
                        },
                        averageTime: 1,
                        score: 1
                    }
                },
                {
                    $sort: { score: -1 }
                },
                {
                    $limit: limit
                }
            ]);

            return leaderboard;
        } catch (error) {
            logger.error('Leaderboard error:', error);
            throw error;
        }
    }
} 