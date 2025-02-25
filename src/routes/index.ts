import express, { Router, Application } from 'express';
import IndexController from '../controllers/index';
import QuestionService, { SearchFilters } from '../services/questionService';
import AuthController from '../controllers/authController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import UserService from '../services/userService';
import User from '../models/user';
import AttemptService from '../services/attemptService';

export function setRoutes(app: Application): Router {
    const router = Router();
    const questionService = new QuestionService();
    const indexController = new IndexController(questionService);
    const authController = new AuthController();
    const userService = new UserService();
    const attemptService = new AttemptService();

    // Debug middleware - add more detail
    router.use((req, res, next) => {
        console.log('Request details:', {
            fullUrl: `${req.method} ${req.baseUrl}${req.path}`,
            headers: req.headers,
            body: req.body,
            params: req.params,
            query: req.query
        });
        next();
    });

    // Auth routes
    router.post('/auth/register', authController.register.bind(authController));
    router.post('/auth/login', authController.login.bind(authController));
    
    // Password reset routes - move these before mounting the router
    router.post('/auth/forgot-password', async (req, res) => {
        try {
            console.log('Forgot password request for:', req.body.email);
            const result = await userService.initiatePasswordReset(req.body.email);
            res.json(result);
        } catch (error: any) {
            console.error('Password reset error:', error);
            res.status(400).json({ error: error.message });
        }
    });

    // Attempt routes - Move these BEFORE the general question routes
    router.post('/questions/:id/attempt', authenticateToken, async (req, res) => {
        try {
            console.log('Attempt request:', {
                questionId: req.params.id,
                userId: req.user?.id,
                selectedOption: req.body.selectedOption
            });

            const attemptData = {
                userId: req.user!.id,
                questionId: req.params.id,
                selectedOption: req.body.selectedOption,
                timeSpent: req.body.timeSpent
            };

            const attempt = await attemptService.submitAttempt(attemptData);
            res.json(attempt);
        } catch (error: any) {
            console.error('Attempt error:', error);
            res.status(400).json({ error: error.message });
        }
    });

    // Move this AFTER the attempt route and BEFORE the general routes
    router.get('/questions/search', async (req, res) => {
        try {
            console.log('Raw query params:', req.query);
            const filters: SearchFilters = {
                search: req.query.search as string,
                category: typeof req.query.category === 'string' ? [req.query.category] : undefined,
                difficulty: req.query.difficulty as 'easy' | 'medium' | 'hard',
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10
            };
            console.log('Processed filters:', filters);
            const results = await questionService.searchQuestions(filters);
            res.json(results);
        } catch (error: any) {
            console.error('Search error:', error);
            res.status(400).json({ error: error.message });
        }
    });

    router.get('/questions/categories', async (req, res) => {
        try {
            const categories = await questionService.getCategories();
            res.json(categories);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // Leaderboard routes - Move this up with other protected routes
    router.get('/leaderboard', async (req, res) => {
        try {
            console.log('Leaderboard request:', {
                timeframe: req.query.timeframe,
                category: req.query.category,
                limit: req.query.limit
            });

            const timeframe = req.query.timeframe as 'daily' | 'weekly' | 'monthly' | 'all-time';
            const category = req.query.category as string;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

            console.log('Processed params:', { timeframe, category, limit });

            const leaderboard = await attemptService.getLeaderboard({
                timeframe,
                category,
                limit
            });
            
            console.log('Leaderboard results:', leaderboard);
            res.json(leaderboard);
        } catch (error: any) {
            console.error('Leaderboard error:', error);
            res.status(400).json({ error: error.message });
        }
    });

    // Then the general routes
    router.get('/questions', indexController.getQuestions.bind(indexController));
    router.get('/questions/:id', indexController.getQuestionById.bind(indexController));

    router.put('/questions/:id', 
        authenticateToken, 
        authorizeRoles('teacher', 'admin'), 
        indexController.updateQuestion.bind(indexController)
    );

    router.delete('/questions/:id', 
        authenticateToken, 
        authorizeRoles('admin'), 
        indexController.deleteQuestion.bind(indexController)
    );

    // Test route
    router.get('/test', (req, res) => {
        res.json({ message: 'Routes are working' });
    });

    router.post('/auth/reset-password/:token', async (req, res) => {
        try {
            const result = await userService.resetPassword(
                req.params.token,
                req.body.password
            );
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // User profile routes
    router.get('/user/profile', authenticateToken, async (req, res) => {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    router.put('/user/profile', authenticateToken, async (req, res) => {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const updates = {
                username: req.body.username,
                email: req.body.email
            };
            
            const user = await User.findByIdAndUpdate(
                req.user.id,
                updates,
                { new: true, runValidators: true }
            ).select('-password');
            
            res.json(user);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    router.delete('/user/account', authenticateToken, async (req, res) => {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            await User.findByIdAndDelete(req.user.id);
            res.json({ message: 'Account deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // Add email verification route
    router.get('/auth/verify-email/:token', async (req, res) => {
        try {
            const result = await authController.verifyEmail(req.params.token);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    router.get('/users/me/stats', authenticateToken, async (req, res) => {
        try {
            const stats = await attemptService.getUserStats(req.user!.id);
            res.json(stats);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    router.get('/questions/:id/stats', async (req, res) => {
        try {
            const stats = await attemptService.getQuestionStats(req.params.id);
            res.json(stats);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // Mount the router
    app.use('/api', router);

    // Simple route logging
    console.log('Routes set up successfully');

    return router;
}

