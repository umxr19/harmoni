import Attempt, { IAttempt } from '../models/attempt';
import Question from '../models/question';

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
        const correctOption = question.options.find(opt => opt.isCorrect);
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
        const attempts = await Attempt.find({ user: userId });
        
        return {
            totalAttempts: attempts.length,
            correctAnswers: attempts.filter(a => a.isCorrect).length,
            averageTime: attempts.reduce((acc, curr) => acc + curr.timeSpent, 0) / attempts.length || 0,
            accuracy: (attempts.filter(a => a.isCorrect).length / attempts.length) * 100 || 0
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
            console.error('Leaderboard error:', error);
            throw error;
        }
    }
} 