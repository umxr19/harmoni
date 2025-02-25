import crypto from 'crypto';
import User, { IUser } from '../models/user';
import { sendEmail } from '../utils/emailService';

export default class UserService {
    async initiatePasswordReset(email: string) {
        const user = await User.findOne({ email }) as IUser;
        if (!user) {
            throw new Error('User not found');
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        // Send reset email
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            text: `Please click the following link to reset your password: ${resetUrl}`
        });

        return { message: 'Password reset email sent' };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new Error('Invalid or expired reset token');
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return { message: 'Password successfully reset' };
    }
} 