"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Route to get all registered routes
router.get('/routes', (req, res) => {
    const routes = [];
    // @ts-ignore - Express doesn't expose _router in types
    const expressRoutes = req.app._router.stack
        .filter((r) => r.route)
        .map((r) => {
        const method = Object.keys(r.route.methods)[0].toUpperCase();
        return `${method} ${r.route.path}`;
    });
    res.json({
        routes: expressRoutes
    });
});
// Route to test authentication
router.get('/auth', (req, res) => {
    res.json({
        user: req.user || null,
        authenticated: !!req.user,
        headers: req.headers
    });
});
// Route to test error handling
router.get('/error/:code', (req, res) => {
    const code = parseInt(req.params.code);
    res.status(code).json({
        error: `Test error with code ${code}`
    });
});
// Route to view request headers
router.get('/headers', (req, res) => {
    res.json({
        headers: req.headers
    });
});
// Simple ping endpoint for connectivity checks
router.get('/ping', (req, res) => {
    // Check if JWT_SECRET is properly configured
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const isDefaultSecret = jwtSecret === 'your-secret-key';
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        authentication: {
            status: 'active',
            jwtConfigured: !isDefaultSecret,
            usingDefaultSecret: isDefaultSecret,
            // Return connection info that's safe to share
            databaseConnected: !!req.app.get('dbConnection')
        }
    });
});
exports.default = router;
