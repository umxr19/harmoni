"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRoutes = void 0;
const authRoutes_1 = __importDefault(require("./authRoutes"));
const questionRoutes_1 = __importDefault(require("./questionRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const practiceRoutes_1 = __importDefault(require("./practiceRoutes"));
const classroomRoutes_1 = __importDefault(require("./classroomRoutes"));
const analyticsRoutes_1 = __importDefault(require("./analyticsRoutes"));
const debugRoutes_1 = __importDefault(require("./debugRoutes"));
const examRoutes_1 = __importDefault(require("./examRoutes"));
const wellbeingRoutes_1 = __importDefault(require("./wellbeingRoutes"));
const studyScheduleRoutes_1 = __importDefault(require("./studyScheduleRoutes"));
const logger_1 = __importDefault(require("../utils/logger"));
const setRoutes = (app) => {
    // API routes
    app.use('/api/auth', authRoutes_1.default);
    app.use('/api/questions', questionRoutes_1.default);
    app.use('/api/users', userRoutes_1.default);
    app.use('/api/practice', practiceRoutes_1.default);
    app.use('/api/classrooms', classroomRoutes_1.default);
    app.use('/api/analytics', analyticsRoutes_1.default);
    app.use('/api/exams', examRoutes_1.default);
    app.use('/api/wellbeing', wellbeingRoutes_1.default);
    app.use('/api/study', studyScheduleRoutes_1.default);
    // Debug routes (only in development)
    if (process.env.NODE_ENV !== 'production') {
        app.use('/api/debug', debugRoutes_1.default);
        logger_1.default.info('Debug routes enabled - access at /api/debug/*');
    }
    // Debug route to list all registered routes
    app.get('/api/debug/routes', (req, res) => {
        const routes = [];
        app._router.stack.forEach((middleware) => {
            if (middleware.route) {
                // Routes registered directly on the app
                routes.push({
                    path: middleware.route.path,
                    methods: Object.keys(middleware.route.methods)
                });
            }
            else if (middleware.name === 'router') {
                // Router middleware
                middleware.handle.stack.forEach((handler) => {
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
exports.setRoutes = setRoutes;
