import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/userModel';
import { sendEmail } from '../utils/emailService';
import AuthService from '../services/authService';
import { signToken } from '../utils/jwtHelper';
import logger from "../utils/logger";

export default class AuthController {
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async register(userData: any) {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create new user
        const user = new User({
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            role: userData.role || 'student' // Default role is student
        });

        await user.save();

        // Generate JWT token - fixed type issue
        const token = jwt.sign(
            { id: user._id, role: user.role },
            Buffer.from(this.JWT_SECRET),
            { expiresIn: this.JWT_EXPIRES_IN } as SignOptions
        );

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
    }

    async login(email: string, password: string) {
        try {
            // Log with proper logger
            logger.info('Processing login for:', email);
            
            // Find the user
            const user = await User.findOne({ email });
            
            if (!user) {
                logger.warn('Login failed: User not found:', email);
                throw new Error('Invalid email or password');
            }
            
            // Check password
            const isMatch = await user.comparePassword(password);
            
            if (!isMatch) {
                logger.warn('Login failed: Invalid password for:', email);
                throw new Error('Invalid email or password');
            }
            
            // Generate token
            logger.info('Login successful, generating token for:', email);
            
            const payload = {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            };
            
            const token = signToken(
                { ...payload, id: typeof payload.id === 'string' ? payload.id : String(payload.id) },
                process.env.JWT_SECRET || 'your-secret-key',
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
            logger.error('Login error in controller:', error);
            throw error;
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

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Log with proper logger
        logger.info('Processing login for:', email);
        
        // Find the user
        const user = await User.findOne({ email });
        
        if (!user) {
            logger.warn('Login failed: User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            logger.warn('Login failed: Invalid password for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Generate token on success
        logger.info('Login successful, generating token for:', email);
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
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
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            role: role || 'student'
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during registration' });
    }
};

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user!.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data' });
    }
}; 