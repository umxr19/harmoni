import { Request, Response } from 'express';
import { Question } from '../models/questionModel';

export const createQuestion = async (req: Request, res: Response) => {
    try {
        const question = new Question({
            ...req.body,
            createdBy: req.user!.id
        });
        await question.save();
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Error creating question' });
    }
};

export const getQuestions = async (req: Request, res: Response) => {
    try {
        const { category, difficulty, type } = req.query;
        const query: any = {};

        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        if (type) query.type = type;

        const questions = await Question.find(query)
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });

        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions' });
    }
};

export const getQuestionById = async (req: Request, res: Response) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('createdBy', 'username');

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching question' });
    }
};

export const updateQuestion = async (req: Request, res: Response) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check if user is the creator or an admin
        if (question.createdBy.toString() !== req.user!.id && req.user!.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this question' });
        }

        Object.assign(question, req.body);
        await question.save();

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Error updating question' });
    }
};

export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check if user is the creator or an admin
        if (question.createdBy.toString() !== req.user!.id && req.user!.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this question' });
        }

        await Question.deleteOne({ _id: req.params.id });
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting question' });
    }
}; 