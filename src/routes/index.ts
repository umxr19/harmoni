import { Express } from 'express';
import authRoutes from './authRoutes';
import questionRoutes from './questionRoutes';
import userRoutes from './userRoutes';
import practiceRoutes from './practiceRoutes';
import classroomRoutes from './classroomRoutes';
import analyticsRoutes from './analyticsRoutes';
import debugRoutes from './debugRoutes';
import examRoutes from './examRoutes';
import wellbeingRoutes from './wellbeingRoutes';
import studyScheduleRoutes from './studyScheduleRoutes';
import logger from '../utils/logger';

export const setRoutes = (app: Express) => {
    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/questions', questionRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/practice', practiceRoutes);
    app.use('/api/classrooms', classroomRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/exams', examRoutes);
    app.use('/api/wellbeing', wellbeingRoutes);
    app.use('/api/study', studyScheduleRoutes);

    // Debug routes (only in development)
    if (process.env.NODE_ENV !== 'production') {
        app.use('/api/debug', debugRoutes);
        logger.info('Debug routes enabled - access at /api/debug/*');
    }

    // Debug route to list all registered routes
    app.get('/api/debug/routes', (req, res) => {
        const routes: any[] = [];
        app._router.stack.forEach((middleware: any) => {
            if (middleware.route) {
                // Routes registered directly on the app
                routes.push({
                    path: middleware.route.path,
                    methods: Object.keys(middleware.route.methods)
                });
            } else if (middleware.name === 'router') {
                // Router middleware
                middleware.handle.stack.forEach((handler: any) => {
                    if (handler.route) {
                        routes.push({
                            path: handler.route.path,
                            methods: Object.keys(handler.route.methods)
                        });
                    }
                });
            }
        });
        res.json(routes);
    });
}; 