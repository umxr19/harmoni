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
exports.getCurrentUser = exports.register = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../models/userModel");
const authService_1 = __importDefault(require("../services/authService"));
const jwtHelper_1 = require("../utils/jwtHelper");
const logger_1 = __importDefault(require("../utils/logger"));
class AuthController {
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
        this.authService = new authService_1.default();
    }
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if user already exists
            const existingUser = yield userModel_1.User.findOne({ email: userData.email });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }
            // Hash password
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPassword = yield bcrypt_1.default.hash(userData.password, salt);
            // Create new user
            const user = new userModel_1.User({
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                role: userData.role || 'student' // Default role is student
            });
            yield user.save();
            // Generate JWT token - fixed type issue
            const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, Buffer.from(this.JWT_SECRET), { expiresIn: this.JWT_EXPIRES_IN });
            // Return user data and token
            return {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            };
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Log with proper logger
                logger_1.default.info('Processing login for:', email);
                // Find the user
                const user = yield userModel_1.User.findOne({ email });
                if (!user) {
                    logger_1.default.warn('Login failed: User not found:', email);
                    throw new Error('Invalid email or password');
                }
                // Check password
                const isMatch = yield user.comparePassword(password);
                if (!isMatch) {
                    logger_1.default.warn('Login failed: Invalid password for:', email);
                    throw new Error('Invalid email or password');
                }
                // Generate token
                logger_1.default.info('Login successful, generating token for:', email);
                const payload = {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role
                };
                const token = (0, jwtHelper_1.signToken)(Object.assign(Object.assign({}, payload), { id: typeof payload.id === 'string' ? payload.id : String(payload.id) }), process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
                return {
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                };
            }
            catch (error) {
                logger_1.default.error('Login error in controller:', error);
                throw error;
            }
        });
    }
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.authService.verifyEmail(token);
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
}
exports.default = AuthController;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Log with proper logger
        logger_1.default.info('Processing login for:', email);
        // Find the user
        const user = yield userModel_1.User.findOne({ email });
        if (!user) {
            logger_1.default.warn('Login failed: User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Check password
        const isPasswordValid = yield user.comparePassword(password);
        if (!isPasswordValid) {
            logger_1.default.warn('Login failed: Invalid password for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Generate token on success
        logger_1.default.info('Login successful, generating token for:', email);
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        // Return successful response
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        logger_1.default.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});
exports.login = login;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, role } = req.body;
        // Check if user already exists
        const existingUser = yield userModel_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Create new user
        const user = new userModel_1.User({
            username,
            email,
            password,
            role: role || 'student'
        });
        yield user.save();
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error during registration' });
    }
});
exports.register = register;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user data' });
    }
});
exports.getCurrentUser = getCurrentUser;
