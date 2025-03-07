"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureStudent = exports.authorizeRoles = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = __importDefault(require("../config"));
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get token from header
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        const jwtSecret = config_1.default.jwt.secret;
        if (!token || !jwtSecret) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        try {
            // Verify token with proper type checking
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            if (!decoded.id || !decoded.role) {
                throw new Error('Invalid token payload');
            }
            // Add user to request
            req.user = decoded;
            next();
        }
        catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
});
exports.protect = protect;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access forbidden' });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
// Middleware to ensure student access
const ensureStudent = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    // Log student check for debugging
    logger_1.default.info('Student check:', {
        userRole: req.user.role,
        path: req.path
    });
    if (req.user.role !== 'student') {
        return res.status(403).json({
            error: 'Access denied',
            message: 'Only students can access this resource'
        });
    }
    next();
};
exports.ensureStudent = ensureStudent;
