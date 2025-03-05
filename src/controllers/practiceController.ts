import { Request, Response } from 'express';
import { Question } from '../models/questionModel';
import { Progress } from '../models/progressModel';
import PracticeService from '../services/practiceService';

const practiceService = new PracticeService();

export const startPractice = async (req: Request, res: Response) => {
    try {
        const { category, difficulty, type } = req.body;
        const query: any = {};

        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        if (type) query.type = type;

        const questions = await Question.find(query)
            .select('-correctAnswer -explanation')
            .limit(10);

        res.json({
            sessionId: Date.now().toString(),
            questions
        });
    } catch (error) {
        res.status(500).json({ message: 'Error starting practice session' });
    }
};

export const submitAnswer = async (req: Request, res: Response) => {
    try {
        const { questionId, answer, timeSpent } = req.body;
        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const isCorrect = answer === question.correctAnswer;
        const score = isCorrect ? 100 : 0;

        const progress = new Progress({
            userId: req.user!.id,
            questionId,
            answer,
            isCorrect,
            score,
            timeSpent
        });

        await progress.save();

        res.json({
            isCorrect,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation
        });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting answer' });
    }
};

export const getPracticeSession = async (req: Request, res: Response) => {
    try {
        const progress = await Progress.find({
            userId: req.user!.id,
            createdAt: {
                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
        })
        .populate('questionId', 'title content type options difficulty category')
        .sort({ createdAt: -1 });

        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching practice session' });
    }
};

export const getPracticeHistory = async (req: Request, res: Response) => {
    try {
        const history = await Progress.aggregate([
            { $match: { userId: req.user!.id } },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        category: '$questionId.category'
                    },
                    totalQuestions: { $sum: 1 },
                    correctAnswers: { $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] } },
                    averageScore: { $avg: '$score' },
                    averageTimeSpent: { $avg: '$timeSpent' }
                }
            },
            { $sort: { '_id.date': -1 } }
        ]);

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching practice history' });
    }
};

// Get a specific practice set by ID
export const getPracticeSet = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const questions = await practiceService.getPracticeSet(id, userId);
        res.json(questions);
    } catch (error: any) {
        res.status(404).json({ 
            message: error.message || 'Error fetching practice set'
        });
    }
};

// Get all practice sets
export const getAllPracticeSets = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const practiceSets = await practiceService.getAllPracticeSets(userId);
        res.json(practiceSets);
    } catch (error: any) {
        res.status(500).json({ 
            message: error.message || 'Error fetching practice sets'
        });
    }
}; 