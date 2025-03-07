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
const userModel_1 = require("../models/userModel");
const emailService_1 = require("../utils/emailService");
const crypto_1 = __importDefault(require("crypto"));
const jwtHelper_1 = require("../utils/jwtHelper");
const logger_1 = __importDefault(require("../utils/logger"));
class AuthService {
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield userModel_1.User.findOne({
                $or: [{ email: userData.email }, { username: userData.username }]
            });
            if (existingUser) {
                throw new Error('Username or email already exists');
            }
            // Generate verification token
            const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
            // Create new user with verification token
            const user = new userModel_1.User(Object.assign(Object.assign({}, userData), { emailVerificationToken: verificationToken, isEmailVerified: false }));
            // Save the user to database
            yield user.save();
            // Try to send verification email with correct frontend URL
            try {
                const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
                yield (0, emailService_1.sendEmail)({
                    to: user.email,
                    subject: 'Verify Your Email Address',
                    text: `Please verify your email address by clicking the following link: ${verificationUrl}`
                });
            }
            catch (error) {
                logger_1.default.error('Failed to send verification email:', error);
                // Continue even if email fails - we'll handle this separately
            }
            // Generate JWT token for immediate login
            const secret = process.env.JWT_SECRET || 'your-secret-key';
            const payload = {
                id: user._id,
                email: user.email,
                role: user.role
            };
            try {
                const token = (0, jwtHelper_1.signToken)(Object.assign(Object.assign({}, payload), { id: typeof payload.id === 'string' ? payload.id : String(payload.id) }), secret, { expiresIn: '24h' });
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
                logger_1.default.error('Token generation error:', error);
                throw new Error('Failed to generate token');
            }
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.User.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }
            const isMatch = yield user.comparePassword(password);
            if (!isMatch) {
                throw new Error('Invalid password');
            }
            return this.generateToken(user);
        });
    }
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.User.findOne({ emailVerificationToken: token });
            if (!user) {
                throw new Error('Invalid verification token');
            }
            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            yield user.save();
            return { message: 'Email verified successfully' };
        });
    }
    generateToken(user) {
        // Throw error in production if JWT_SECRET is not defined
        if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        // Only use fallback in development
        const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-temporary-secret-key' : '');
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role
        };
        try {
            const token = (0, jwtHelper_1.signToken)(Object.assign(Object.assign({}, payload), { id: typeof payload.id === 'string' ? payload.id : String(payload.id) }), secret, { expiresIn: '24h' });
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
            logger_1.default.error('Token generation error:', error);
            throw new Error('Failed to generate token');
        }
    }
}
exports.default = AuthService;
