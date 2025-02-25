import { Request, Response } from 'express';
import AuthService from '../services/authService';

export default class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async register(req: Request, res: Response) {
        try {
            console.log('Register method called with body:', req.body);
            const result = await this.authService.register(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            console.error('Registration error:', error);
            res.status(400).json({ error: error.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            res.json(result);
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    }

    async verifyEmail(token: string) {
        try {
            return await this.authService.verifyEmail(token);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
} 