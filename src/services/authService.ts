import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import User, { IUser } from '../models/user';
import { sendEmail } from '../utils/emailService';
import crypto from 'crypto';

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
        
        const user = new User({
            ...userData,
            emailVerificationToken: verificationToken,
            isEmailVerified: false
        });

        await user.save();

        // Send verification email
        const verificationUrl = `http://localhost:3000/verify-email/${verificationToken}`;
        await sendEmail({
            to: user.email,
            subject: 'Verify your email',
            text: `Please click the following link to verify your email: ${verificationUrl}`
        });

        return this.generateToken(user);
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
        const secret: Secret = process.env.JWT_SECRET ?? '';
        
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        try {
            const token = jwt.sign(payload, secret, { expiresIn: '24h' });
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
            console.error('Token generation error:', error);
            throw new Error('Failed to generate token');
        }
    }
} 