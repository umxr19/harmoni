import { User, IUser } from '../models/userModel';
import bcrypt from 'bcrypt';

export default class ProfileService {
    async updateProfile(userId: string, updates: Partial<IUser>) {
        // Don't allow updating sensitive fields
        const allowedUpdates = {
            username: updates.username,
            email: updates.email,
            avatarUrl: updates.avatarUrl ? updates.avatarUrl as string : undefined
        };
        
        // Check if username or email already exists
        if (updates.username || updates.email) {
            const existingUser = await User.findOne({
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
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            // Use type assertion to handle additional properties
            updates as any,
            { new: true }
        );
        
        if (!updatedUser) {
            throw new Error('User not found');
        }
        
        return updatedUser;
    }
    
    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        return { message: 'Password updated successfully' };
    }
    
    async updateNotificationPreferences(userId: string, preferences: {
        emailNotifications: boolean;
        studyReminders: boolean;
    }) {
        const user = await User.findByIdAndUpdate(
            userId,
            { notificationPreferences: preferences },
            { new: true }
        ).select('-password');
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    }
    
    async deleteAccount(userId: string) {
        const result = await User.findByIdAndDelete(userId);
        
        if (!result) {
            throw new Error('User not found');
        }
        
        // Also delete related data (attempts, etc.)
        // This would be implemented based on your data model
        
        return { message: 'Account deleted successfully' };
    }
} 