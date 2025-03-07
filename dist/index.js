"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./utils/logger"));
// Load environment variables before any other imports
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const questionRoutes_1 = __importDefault(require("./routes/questionRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const practiceRoutes_1 = __importDefault(require("./routes/practiceRoutes"));
const progressRoutes_1 = __importDefault(require("./routes/progressRoutes"));
const examRoutes_1 = __importDefault(require("./routes/examRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json());
// Log all incoming requests for debugging
app.use((req, res, next) => {
    logger_1.default.info(`${req.method} ${req.url}`);
    next();
});
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/question-bank')
    .then(() => logger_1.default.info('Connected to MongoDB'))
    .catch(err => logger_1.default.error('MongoDB connection error:', err));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/questions', questionRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/practice', practiceRoutes_1.default);
app.use('/api/progress', progressRoutes_1.default);
app.use('/api/exams', examRoutes_1.default);
// Add this after your routes are registered
logger_1.default.info('Registered routes:');
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        // Routes registered directly
        logger_1.default.info(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
    }
    else if (middleware.name === 'router') {
        // Router middleware
        middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
                const path = handler.route.path;
                const methods = Object.keys(handler.route.methods);
                logger_1.default.info(`${methods} /api${middleware.regexp.source.replace('\\/?(?=\\/|$)', '')}${path}`);
            }
        });
    }
});
app.listen(PORT, () => {
    logger_1.default.info(`Server running on port ${PORT}`);
});
