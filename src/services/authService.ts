import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import { User, IUser } from '../models/userModel';
import { sendEmail } from '../utils/emailService';
import crypto from 'crypto';
import { signToken } from '../utils/jwtHelper';
import logger from '../utils/logger';

export default class AuthService {
    async register(userData: { username: string; email: string; password: string; role?: string }) {
        const existingUser = await User.findOne({ 
            $or: [{ email: userData.email }, { username: userData.username }] 
        });
        
        if (existingUser) {
            throw new Error('Username or email already exists');
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        // Create new user with verification token
        const user = new User({
            ...userData,
            emailVerificationToken: verificationToken,
            isEmailVerified: false
        });
        
        // Save the user to database
        await user.save();
        
        // Try to send verification email with correct frontend URL
        try {
            const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
            
            await sendEmail({
                to: user.email,
                subject: 'Verify Your Email Address',
                text: `Please verify your email address by clicking the following link: ${verificationUrl}`
            });
        } catch (error) {
            logger.error('Failed to send verification email:', error);
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
            const token = signToken(
                { ...payload, id: typeof payload.id === 'string' ? payload.id : String(payload.id) },
                secret,
                { expiresIn: '24h' }
            );
            return {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            };
        } catch (error) {
            logger.error('Token generation error:', error);
            throw new Error('Failed to generate token');
        }
    }

    async login(email: string, password: string) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid password');
        }

        return this.generateToken(user);
    }

    async verifyEmail(token: string) {
        const user = await User.findOne({ emailVerificationToken: token });
        if (!user) {
            throw new Error('Invalid verification token');
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        return { message: 'Email verified successfully' };
    }

    private generateToken(user: IUser) {
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
            const token = signToken(
                { ...payload, id: typeof payload.id === 'string' ? payload.id : String(payload.id) },
                secret,
                { expiresIn: '24h' }
            );
            return {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            };
        } catch (error) {
            logger.error('Token generation error:', error);
            throw new Error('Failed to generate token');
        }
    }
} 