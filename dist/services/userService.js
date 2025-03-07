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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const userModel_1 = require("../models/userModel");
const emailService_1 = require("../utils/emailService");
const logger_1 = __importDefault(require("../utils/logger"));
class UserService {
    initiatePasswordReset(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.User.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }
            // Generate reset token
            const resetToken = crypto_1.default.randomBytes(32).toString('hex');
            // Invalidate any existing tokens by setting them to expired
            if (user.resetPasswordToken) {
                user.resetPasswordExpires = new Date(Date.now() - 1); // Set to expired
            }
            // Set new token with 24-hour expiration
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            yield user.save();
            // Debug log to verify the frontend URL
            logger_1.default.info('Environment variables:', {
                FRONTEND_URL: process.env.FRONTEND_URL,
                NODE_ENV: process.env.NODE_ENV
            });
            // Send reset email with hardcoded frontend URL for testing
            const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
            logger_1.default.info('Generated reset URL:', resetUrl);
            try {
                const emailResult = yield (0, emailService_1.sendEmail)({
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
            }
            catch (error) {
                logger_1.default.error('Failed to send password reset email:', error);
                // Don't throw the error, just log it and continue
                return { message: 'Password reset initiated (email delivery may be delayed)' };
            }
        });
    }
    resetPassword(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info('Attempting password reset with token:', token);
            const user = yield userModel_1.User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });
            if (!user) {
                logger_1.default.info('Reset password failed: Invalid or expired token');
                throw new Error('Invalid or expired reset token');
            }
            logger_1.default.info('Reset password: Valid token for user:', user.email);
            // Update the password
            user.password = newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            yield user.save();
            logger_1.default.info('Password reset successful for user:', user.email);
            return { message: 'Password successfully reset' };
        });
    }
    getUserProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.User.findById(userId).select('-password');
            return user;
        });
    }
    updateUserProfile(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.User.findById(userId);
            if (!user)
                return null;
            // Update fields if provided
            if (updateData.username)
                user.username = updateData.username;
            if (updateData.email)
                user.email = updateData.email;
            if (updateData.newPassword) {
                if (!updateData.currentPassword) {
                    throw new Error('Current password is required');
                }
                const isPasswordValid = yield user.comparePassword(updateData.currentPassword);
                if (!isPasswordValid) {
                    throw new Error('Current password is incorrect');
                }
                user.password = updateData.newPassword;
            }
            yield user.save();
            // Return updated user without password
            const updatedUser = user.toObject();
            // Create a new object without the password
            const { password } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
            return userWithoutPassword;
        });
    }
}
exports.default = UserService;
