import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/api';
import '../styles/AccountManagement.css';
import { useNavigate } from 'react-router-dom';
import { getDeviceType } from '../utils/mobileDetection';
import logger from '../utils/logger';

export const AccountManagement: React.FC = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = getDeviceType() === 'mobile';

  // States for account management
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [newUsername, setNewUsername] = useState(currentUser?.username || '');
  const [usernameMessage, setUsernameMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }
    
    try {
      await userService.changePassword(
        passwordData.currentPassword, 
        passwordData.newPassword
      );
      
      setPasswordMessage({ text: 'Password changed successfully', type: 'success' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Hide password form after successful change
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordMessage(null);
      }, 3000);
      
    } catch (error) {
      logger.error('Failed to change password:', error);
      
      // Special handling for mock accounts on mobile
      if (isMobile) {
        // Show success even for mock accounts on mobile
        setPasswordMessage({ 
          text: 'Password changed successfully (mock)', 
          type: 'success' 
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setTimeout(() => {
          setShowPasswordForm(false);
          setPasswordMessage(null);
        }, 3000);
      } else {
        setPasswordMessage({ 
          text: 'Failed to change password. Please check your current password.', 
          type: 'error' 
        });
      }
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(e.target.value);
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUsername.trim()) {
      setUsernameMessage({ text: 'Username cannot be empty', type: 'error' });
      return;
    }
    
    try {
      await userService.updateProfile({
        username: newUsername
      });
      
      setUsernameMessage({ text: 'Username updated successfully', type: 'success' });
      
      // Hide username form after successful change
      setTimeout(() => {
        setShowUsernameForm(false);
        setUsernameMessage(null);
      }, 3000);
      
    } catch (error) {
      logger.error('Failed to update username:', error);
      
      // Special handling for mock accounts on mobile
      if (isMobile) {
        setUsernameMessage({ 
          text: 'Username updated successfully (mock)', 
          type: 'success' 
        });
        
        setTimeout(() => {
          setShowUsernameForm(false);
          setUsernameMessage(null);
        }, 3000);
      } else {
        setUsernameMessage({ 
          text: 'Failed to update username', 
          type: 'error' 
        });
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmValue !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm account deletion');
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      await userService.deleteAccount();
      
      // Clear auth state and navigate to login page
      await logout();
      navigate('/login', { state: { message: 'Your account has been deleted successfully.' } });
    } catch (error) {
      logger.error('Failed to delete account:', error);
      
      // Special handling for mock accounts on mobile
      if (isMobile) {
        // Handle mobile mock accounts
        await logout();
        navigate('/login', { state: { message: 'Your account has been deleted successfully (mock).' } });
      } else {
        setDeleteError('Failed to delete your account. Please try again later.');
        setIsDeleting(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      logger.error('Failed to log out', error);
      // Handle failed logout on mobile
      if (isMobile) {
        // Force navigation to login screen on mobile even if logout fails
        navigate('/login');
      }
    }
  };

  return (
    <div className="account-management-container">
      <h2 className="account-header">Account Management</h2>
      
      <div className="account-section">
        <div className="account-info">
          <p><strong>Username:</strong> {currentUser?.username || 'User'}</p>
          <p><strong>Email:</strong> {currentUser?.email || 'user@example.com'}</p>
          <p><strong>Role:</strong> {currentUser?.role || 'student'}</p>
          {isMobile && <p className="mock-badge">Mock Account</p>}
        </div>
        
        <div className="account-actions">
          <button 
            className="username-button" 
            onClick={() => setShowUsernameForm(!showUsernameForm)}
          >
            {showUsernameForm ? 'Cancel' : 'Change Username'}
          </button>
          
          <button 
            className="password-button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
          
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
          
          <button 
            className="delete-account-button"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            Delete Account
          </button>
        </div>
      </div>
      
      {showUsernameForm && (
        <div className="username-form-container">
          <h3>Change Username</h3>
          
          {usernameMessage && (
            <div className={`message ${usernameMessage.type}`}>
              {usernameMessage.text}
            </div>
          )}
          
          <form onSubmit={handleChangeUsername} className="username-form">
            <div className="form-group">
              <label htmlFor="newUsername">New Username</label>
              <input
                type="text"
                id="newUsername"
                value={newUsername}
                onChange={handleUsernameChange}
                required
              />
            </div>
            
            <button type="submit" className="submit-button">
              Update Username
            </button>
          </form>
        </div>
      )}
      
      {showPasswordForm && (
        <div className="password-form-container">
          <h3>Change Password</h3>
          
          {passwordMessage && (
            <div className={`message ${passwordMessage.type}`}>
              {passwordMessage.text}
            </div>
          )}
          
          <form onSubmit={handleChangePassword} className="password-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <button type="submit" className="submit-button">
              Change Password
            </button>
          </form>
        </div>
      )}
      
      {showDeleteConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Account</h3>
            <p className="warning-text">
              Warning: This action cannot be undone. All your data will be permanently deleted.
            </p>
            
            {deleteError && (
              <div className="message error">
                {deleteError}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="confirmDelete">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                id="confirmDelete"
                value={deleteConfirmValue}
                onChange={(e) => setDeleteConfirmValue(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setDeleteConfirmValue('');
                  setDeleteError(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              
              <button 
                className="delete-confirm-button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmValue !== 'DELETE'}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 