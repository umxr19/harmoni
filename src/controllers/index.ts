import { Request, Response } from 'express';
import QuestionService from '../services/questionService';
import Joi from 'joi';
import { IQuestion } from '../models/question';

const questionSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    options: Joi.array().items(Joi.object({
        text: Joi.string().required(),
        isCorrect: Joi.boolean().required()
    }))
    .min(2)
    .max(4)
    .custom((value: Array<{ text: string; isCorrect: boolean }>, helpers) => {
        const correctAnswers = value.filter(option => option.isCorrect).length;
        if (correctAnswers !== 1) {
            return helpers.error('array.base', { 
                message: 'Exactly one option must be correct'
            });
        }
        return value;
    })
    .required(),
    category: Joi.array().items(Joi.string()).min(1).required(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
    imageUrl: Joi.string().uri().optional()
});

export default class IndexController {
    private questionService: QuestionService;

    constructor(questionService: QuestionService) {
        this.questionService = questionService;
    }

    async getQuestions(req: Request, res: Response) {
        try {
            const questions = await this.questionService.getQuestions();
            res.json(questions);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch questions' });
        }
    }

    async getQuestionById(req: Request, res: Response) {
        try {
            const question = await this.questionService.getQuestionById(req.params.id);
            res.json(question);
        } catch (error) {
            res.status(404).json({ error: 'Question not found' });
        }
    }

    async addQuestion(req: Request, res: Response) {
        try {
            console.log('Adding question with user:', req.user);
            
            const { error, value } = questionSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            // Add the createdBy field
            const questionData = {
                ...value,
                createdBy: req.user?.id
            };

            console.log('Creating question with data:', questionData);

            const question = await this.questionService.addQuestion(questionData);
            console.log('Question created:', question);

            res.status(201).json(question);
        } catch (error) {
            console.error('Error adding question:', error);
            res.status(400).json({ error: 'Invalid question data' });
        }
    }

    async updateQuestion(req: Request, res: Response) {
        try {
            const question = await this.questionService.updateQuestion(req.params.id, req.body);
            res.json(question);
        } catch (error) {
            res.status(404).json({ error: 'Question not found' });
        }
    }

    async deleteQuestion(req: Request, res: Response) {
        try {
            await this.questionService.deleteQuestion(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(404).json({ error: 'Question not found' });
        }
    }
}