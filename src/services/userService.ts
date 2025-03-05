import crypto from 'crypto';
import { User, IUser } from '../models/userModel';
import { sendEmail } from '../utils/emailService';
import { Types } from 'mongoose';
import logger from '../utils/logger';

export default class UserService {
    async initiatePasswordReset(email: string) {
        const user = await User.findOne({ email }) as IUser;
        if (!user) {
            throw new Error('User not found');
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Invalidate any existing tokens by setting them to expired
        if (user.resetPasswordToken) {
            user.resetPasswordExpires = new Date(Date.now() - 1); // Set to expired
        }
        
        // Set new token with 24-hour expiration
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();

        // Debug log to verify the frontend URL
        logger.info('Environment variables:', {
            FRONTEND_URL: process.env.FRONTEND_URL,
            NODE_ENV: process.env.NODE_ENV
        });

        // Send reset email with hardcoded frontend URL for testing
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        logger.info('Generated reset URL:', resetUrl);
        
        try {
            const emailResult = await sendEmail({
                to: user.email,
                subject: 'Password Reset Request',
                text: `Please click the following link to reset your password: ${resetUrl}\n\nThis link will expire in 24 hours.`
            });
            
            // If we're in development and using a test email service, return the preview URL
            if (process.env.NODE_ENV !== 'production' && emailResult.testEmailUrl) {
                return { 
                    message: 'Password reset email sent',
                    testEmailUrl: emailResult.testEmailUrl
                };
            }
            
            return { message: 'Password reset email sent' };
        } catch (error) {
            logger.error('Failed to send password reset email:', error);
            // Don't throw the error, just log it and continue
            return { message: 'Password reset initiated (email delivery may be delayed)' };
        }
    }

    async resetPassword(token: string, newPassword: string) {
        logger.info('Attempting password reset with token:', token);
        
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            logger.info('Reset password failed: Invalid or expired token');
            throw new Error('Invalid or expired reset token');
        }

        logger.info('Reset password: Valid token for user:', user.email);
        
        // Update the password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        logger.info('Password reset successful for user:', user.email);
        
        return { message: 'Password successfully reset' };
    }

    async getUserProfile(userId: string) {
        const user = await User.findById(userId).select('-password');
        return user;
    }

    async updateUserProfile(userId: string, updateData: any) {
        const user = await User.findById(userId);
        if (!user) return null;

        // Update fields if provided
        if (updateData.username) user.username = updateData.username;
        if (updateData.email) user.email = updateData.email;
        if (updateData.newPassword) {
            if (!updateData.currentPassword) {
                throw new Error('Current password is required');
            }
            
            const isPasswordValid = await user.comparePassword(updateData.currentPassword);
            if (!isPasswordValid) {
                throw new Error('Current password is incorrect');
            }
            
            user.password = updateData.newPassword;
        }

        await user.save();
        
        // Return updated user without password
        const updatedUser = user.toObject();
        // Create a new object without the password
        const { password, ...userWithoutPassword } = updatedUser;
        
        return userWithoutPassword;
    }
} 