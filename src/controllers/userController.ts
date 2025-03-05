import mongoose from 'mongoose';
import { Request, Response } from 'express';
import UserService from '../services/userService';
import logger from '../utils/logger';

// Create an instance of UserService
const userService = new UserService();

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await userService.getUserProfile(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        logger.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const updateData = req.body;
        const updatedUser = await userService.updateUserProfile(userId, updateData);
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        logger.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export class UserController {
    async getProfile(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const User = mongoose.model('User');
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            const Progress = mongoose.model('Progress');
            const stats = await Progress.aggregate([
                { $match: { userId: userId } },
                {
                    $group: {
                        _id: null,
                        totalQuestions: { $sum: 1 },
                        correctAnswers: { $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] } },
                        averageScore: { $avg: '$score' }
                    }
                }
            ]);

            const profile = {
                ...user.toObject(),
                stats: stats[0] || { totalQuestions: 0, correctAnswers: 0, averageScore: 0 }
            };

            res.json(profile);
        } catch (error) {
            logger.error('Error fetching user profile:', error);
            res.status(500).json({ message: 'Error fetching user profile' });
        }
    }

    async getProgress(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const Progress = mongoose.model('Progress');
            const progress = await Progress.find({ userId: userId })
                .sort({ createdAt: -1 })
                .limit(10);
            
            res.json(progress);
        } catch (error) {
            logger.error('Error fetching user progress:', error);
            res.status(500).json({ message: 'Error fetching user progress' });
        }
    }

    async getTeacherStudents(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const User = mongoose.model('User');
            const students = await User.find({ 
                role: 'student',
                'classrooms.teacherId': userId 
            }).select('-password');
            
            res.json(students);
        } catch (error) {
            logger.error('Error fetching teacher students:', error);
            res.status(500).json({ message: 'Error fetching teacher students' });
        }
    }
}