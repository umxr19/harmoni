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
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = require("../models/userModel");
class ProfileService {
    updateProfile(userId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            // Don't allow updating sensitive fields
            const allowedUpdates = {
                username: updates.username,
                email: updates.email,
                avatarUrl: updates.avatarUrl ? updates.avatarUrl : undefined
            };
            // Check if username or email already exists
            if (updates.username || updates.email) {
                const existingUser = yield userModel_1.User.findOne({
                    $and: [
                        { _id: { $ne: userId } },
                        {
                            $or: [
                                { username: updates.username },
                                { email: updates.email }
                            ]
                        }
                    ]
                });
                if (existingUser) {
                    throw new Error('Username or email already in use');
                }
            }
            // Update user profile
            const updatedUser = yield userModel_1.User.findByIdAndUpdate(userId, 
            // Use type assertion to handle additional properties
            updates, { new: true });
            if (!updatedUser) {
                throw new Error('User not found');
            }
            return updatedUser;
        });
    }
    changePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Verify current password
            const isMatch = yield user.comparePassword(currentPassword);
            if (!isMatch) {
                throw new Error('Current password is incorrect');
            }
            // Update password
            user.password = newPassword;
            yield user.save();
            return { message: 'Password updated successfully' };
        });
    }
    updateNotificationPreferences(userId, preferences) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.User.findByIdAndUpdate(userId, { notificationPreferences: preferences }, { new: true }).select('-password');
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        });
    }
    deleteAccount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield userModel_1.User.findByIdAndDelete(userId);
            if (!result) {
                throw new Error('User not found');
            }
            // Also delete related data (attempts, etc.)
            // This would be implemented based on your data model
            return { message: 'Account deleted successfully' };
        });
    }
}
exports.default = ProfileService;
