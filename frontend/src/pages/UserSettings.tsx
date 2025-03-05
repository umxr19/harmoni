import React, { useState } from 'react';
import { useSafeAuth } from '../hooks/useSafeAuth';
import { userService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/UserSettings.css';
import logger from '../utils/logger';

export const UserSettings: React.FC = () => {
  const { currentUser, updateUser, logout, isMockAuth } = useSafeAuth();
  const navigate = useNavigate();
  
  if (isMockAuth) {
    logger.warn('Using mock auth in UserSettings component');
  }
  
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    deleteConfirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      const response = await userService.updateProfile({
        username: formData.username,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword || undefined
      });
      
      // Update the user in context if successful
      if (response.data) {
        updateUser(response.data);
        setMessage({ text: 'Profile updated successfully', type: 'success' });
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (err) {
      logger.error('Failed to update profile:', err);
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (formData.deleteConfirmation !== 'DELETE') {
      setMessage({ text: 'Please type DELETE to confirm account deletion', type: 'error' });
      return;
    }

    try {
      setDeleteLoading(true);
      await userService.deleteAccount();
      await logout();
      navigate('/');
    } catch (err) {
      logger.error('Failed to delete account:', err);
      setMessage({ text: 'Failed to delete account. Please try again.', type: 'error' });
      setDeleteLoading(false);
    }
  };

  return (
    <div className="user-settings-container">
      <div className="settings-header">
        <h1>Account Settings</h1>
      </div>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="settings-content">
        <form onSubmit={handleProfileUpdate}>
          <div className="settings-section">
            <h2>Profile Information</h2>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="settings-section">
            <h2>Change Password</h2>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <div className="settings-section delete-account-section">
          <div className="delete-account-content">
            <div className="delete-account-description">
              <h3>Delete Account</h3>
              <p>Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            
            {!showDeleteConfirm ? (
              <button 
                type="button" 
                className="delete-account-button"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </button>
            ) : (
              <div className="delete-confirmation">
                <p>Please type <strong>DELETE</strong> to confirm:</p>
                <div className="delete-confirmation-input">
                  <input
                    type="text"
                    name="deleteConfirmation"
                    value={formData.deleteConfirmation}
                    onChange={handleChange}
                    placeholder="Type DELETE to confirm"
                  />
                  <div className="delete-confirmation-actions">
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setFormData(prev => ({ ...prev, deleteConfirmation: '' }));
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="confirm-delete-button"
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading || formData.deleteConfirmation !== 'DELETE'}
                    >
                      {deleteLoading ? 'Deleting...' : 'Permanently Delete Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 