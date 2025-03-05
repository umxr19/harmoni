const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get the current user's profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (err) {
        console.error('Error in getUserProfile:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user profile (username, email, etc.)
exports.updateUserProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        
        // Check if username already exists (for another user)
        if (username) {
            const existingUser = await User.findOne({ 
                username,
                _id: { $ne: req.user.id } // Exclude current user
            });
            
            if (existingUser) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }
        
        // Check if email already exists (for another user)
        if (email) {
            const existingUser = await User.findOne({ 
                email,
                _id: { $ne: req.user.id } // Exclude current user
            });
            
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }
        
        // Build update object
        const updateFields = {};
        if (username) updateFields.username = username;
        if (email) updateFields.email = email;
        
        // Update the user
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select('-password');
        
        res.json(updatedUser);
    } catch (err) {
        console.error('Error in updateUserProfile:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Change user password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Validate inputs
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }
        
        // Get user with password
        const user = await User.findById(req.user.id);
        
        // Check if current password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        // Save user with new password
        await user.save();
        
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error in changePassword:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
    try {
        // Delete the user
        await User.findByIdAndDelete(req.user.id);
        
        res.json({ message: 'User account deleted successfully' });
    } catch (err) {
        console.error('Error in deleteAccount:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
}; 