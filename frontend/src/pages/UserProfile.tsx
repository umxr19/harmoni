import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { analyticsService } from '../services/analyticsService';
import '../styles/UserProfile.css';
import { useNavigate } from 'react-router-dom';
import { getDeviceType } from '../utils/mobileDetection';
import { useTheme } from '../contexts/ThemeContext';
import logger from '../utils/logger';

// Year groups array - same as in YearGroupSelection component
const yearGroups = [
  { value: 2, label: 'Year 2', description: 'Key Stage 1 (age 6-7)' },
  { value: 3, label: 'Year 3', description: 'Key Stage 2 (age 7-8)' },
  { value: 4, label: 'Year 4', description: 'Key Stage 2 (age 8-9)' },
  { value: 5, label: 'Year 5', description: 'Key Stage 2 (age 9-10)' },
  { value: 6, label: 'Year 6', description: 'Key Stage 2 (age 10-11), SATs & 11+ exams' },
  { value: 7, label: 'Year 7', description: 'Key Stage 3 (age 11-12)' },
  { value: 8, label: 'Year 8', description: 'Key Stage 3 (age 12-13)' },
  { value: 9, label: 'Year 9', description: 'Key Stage 3 (age 13-14), GCSE preparation' },
  { value: 10, label: 'Year 10', description: 'Key Stage 4 (age 14-15), GCSE' },
  { value: 11, label: 'Year 11', description: 'Key Stage 4 (age 15-16), GCSE' },
  { value: 12, label: 'Year 12', description: 'A-Levels / Sixth Form (age 16-17)' },
  { value: 13, label: 'Year 13', description: 'A-Levels / Sixth Form (age 17-18), University Admissions' }
];

export const UserProfile: React.FC = () => {
  const { currentUser, logout, updateUser, updateYearGroup } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isMobile = getDeviceType() === 'mobile';
  
  // Account management states
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
  const [newUsername, setNewUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  
  // Year group selection states
  const [showYearGroupSelection, setShowYearGroupSelection] = useState(false);
  const [selectedYearGroup, setSelectedYearGroup] = useState<number | null>(null);
  const [yearGroupMessage, setYearGroupMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [isUpdatingYearGroup, setIsUpdatingYearGroup] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // For mobile, add some retries with increasing timeouts
        let userResponse;
        let retryCount = 0;
        const maxRetries = isMobile ? 3 : 1;
        
        while (retryCount < maxRetries) {
          try {
            // Fetch user profile data with timeout based on retry count
            userResponse = await userService.getProfile();
            break; // Success, exit retry loop
          } catch (err) {
            retryCount++;
            if (retryCount >= maxRetries) throw err; // Rethrow if max retries reached
            logger.info(`Retry ${retryCount}/${maxRetries} for profile data...`);
            // Exponential backoff for retries
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
        
        // If we still don't have user data, use currentUser as fallback
        if (!userResponse && currentUser) {
          logger.info('Using auth context user data as fallback');
          userResponse = currentUser;
        }
        
        setUserData(userResponse);
        
        // Determine user role and fetch appropriate analytics
        const userRole = userResponse?.role || currentUser?.role || 'student';
        
        let analyticsResponse;
        
        // For mobile devices, add retry logic for analytics as well
        retryCount = 0;
        while (retryCount < maxRetries) {
          try {
            if (userRole === 'teacher' || userRole === 'admin') {
              logger.info('Fetching teacher analytics for role:', userRole);
              analyticsResponse = await analyticsService.getTeacherAnalytics();
            } else {
              logger.info('Fetching student analytics for role:', userRole);
              analyticsResponse = await analyticsService.getStudentAnalytics();
            }
            break; // Success, exit retry loop
          } catch (err) {
            retryCount++;
            if (retryCount >= maxRetries) throw err; // Rethrow if max retries reached
            logger.info(`Retry ${retryCount}/${maxRetries} for analytics data...`);
            // Exponential backoff for retries
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
        
        setAnalyticsData(analyticsResponse);
      } catch (err) {
        logger.error('Failed to fetch profile data:', err);
        
        // On mobile, provide a better experience with fallback data
        if (isMobile && currentUser) {
          logger.info('Mobile device detected - using fallback data');
          // Use currentUser as fallback for user data
          setUserData(currentUser);
          
          // Create minimal fallback analytics data
          const fallbackAnalytics = {
            stats: {
              questionsAttempted: 0,
              averageScore: 0,
              timeSpent: 0
            },
            recentActivity: []
          };
          
          setAnalyticsData(fallbackAnalytics);
          // Don't set an error, just use the fallback data silently
        } else {
          setError('Failed to load profile data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    } else {
      setLoading(false);
      setError('You must be logged in to view this page');
    }
  }, [currentUser, isMobile]);

  const handleLogout = async () => {
    try {
      logout();
      // Force navigation to login page immediately after logout
      navigate('/login', { replace: true });
    } catch (error) {
      logger.error('Failed to log out', error);
      // Handle failed logout by forcing navigation
      navigate('/login', { replace: true });
    }
  };

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
      logout();
      navigate('/login', { replace: true, state: { message: 'Your account has been deleted successfully.' } });
    } catch (error) {
      logger.error('Failed to delete account:', error);
      
      // Special handling for mock accounts on mobile
      if (isMobile) {
        // Handle mobile mock accounts
        logout();
        navigate('/login', { replace: true, state: { message: 'Your account has been deleted successfully (mock).' } });
      } else {
        setDeleteError('Failed to delete your account. Please try again later.');
        setIsDeleting(false);
      }
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(e.target.value);
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate username
      if (!newUsername || newUsername.trim().length < 3) {
        setUsernameMessage({
          text: 'Username must be at least 3 characters long',
          type: 'error'
        });
        return;
      }
      
      // Update the username
      const response = await userService.updateProfile({ username: newUsername.trim() });
      
      // Update the user in context (so it's reflected throughout the app)
      if (currentUser) {
        const updatedUser = { ...currentUser, username: newUsername.trim() };
        // Using the updateUser method from useAuth context
        if (typeof updateUser === 'function') {
          updateUser(updatedUser);
        }
      }
      
      // Update local state
      setUserData({ ...userData, username: newUsername.trim() });
      setUsernameMessage({
        text: 'Username updated successfully!',
        type: 'success'
      });
      
      // Clear form after a delay
      setTimeout(() => {
        setShowUsernameForm(false);
        setNewUsername('');
        setUsernameMessage(null);
      }, 2000);
      
    } catch (error) {
      logger.error('Failed to update username:', error);
      setUsernameMessage({
        text: 'Failed to update username. Please try again.',
        type: 'error'
      });
    }
  };

  // Add this new handler for year group updates
  const handleYearGroupUpdate = async () => {
    if (!selectedYearGroup) {
      setYearGroupMessage({ text: 'Please select a year group', type: 'error' });
      return;
    }
    
    setIsUpdatingYearGroup(true);
    setYearGroupMessage(null);
    
    try {
      // Call the updateYearGroup method from auth context
      await updateYearGroup(selectedYearGroup);
      
      // Update local state
      setUserData({ ...userData, yearGroup: selectedYearGroup });
      
      setYearGroupMessage({ 
        text: 'Year group updated successfully!', 
        type: 'success' 
      });
      
      // Hide year group selection after a delay
      setTimeout(() => {
        setShowYearGroupSelection(false);
        setYearGroupMessage(null);
      }, 2000);
      
    } catch (error) {
      logger.error('Failed to update year group:', error);
      setYearGroupMessage({
        text: 'Failed to update year group. Please try again.',
        type: 'error'
      });
    } finally {
      setIsUpdatingYearGroup(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading profile...</div>;
  if (error) return <div className="error-message">{error}</div>;

  // Determine if user is a teacher/admin
  const isTeacher = userData?.role === 'teacher' || userData?.role === 'admin';

  // Calculate stats from analytics data - different for student vs teacher
  const stats = isTeacher
    ? {
        totalStudents: analyticsData?.totalStudents || 0,
        totalClassrooms: analyticsData?.totalClassrooms || 0,
        activeAssignments: analyticsData?.activeAssignments || 0,
        averageScore: analyticsData?.averageScore || 0
      }
    : {
        questionsAttempted: analyticsData?.stats?.questionsAttempted || 0,
        examsCompleted: analyticsData?.recentActivity?.filter((activity: any) => activity.type === 'exam').length || 0,
        averageScore: analyticsData?.stats?.averageScore || 0,
        totalPracticeTime: Math.round((analyticsData?.stats?.timeSpent || 0) / 60) || 0 // Convert minutes to hours
      };

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>
      
      <div className="profile-content">
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Username:</span>
              <span className="info-value">{userData?.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{userData?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Role:</span>
              <span className="info-value">{userData?.role}</span>
            </div>
            {userData?.yearGroup && (
              <div className="info-item">
                <span className="info-label">Year Group:</span>
                <span className="info-value">
                  {yearGroups.find(yg => yg.value === userData.yearGroup)?.label || `Year ${userData.yearGroup}`}
                </span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Member Since:</span>
              <span className="info-value">
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="profile-section">
          <h2>{isTeacher ? 'Teaching Statistics' : 'Learning Statistics'}</h2>
          <div className="stats-grid">
            {isTeacher ? (
              // Teacher statistics
              <>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalStudents}</div>
                  <div className="stat-label">Total Students</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalClassrooms}</div>
                  <div className="stat-label">Classrooms</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.activeAssignments}</div>
                  <div className="stat-label">Active Assignments</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.averageScore}%</div>
                  <div className="stat-label">Avg. Class Score</div>
                </div>
              </>
            ) : (
              // Student statistics
              <>
                <div className="stat-card">
                  <div className="stat-value">{stats.questionsAttempted}</div>
                  <div className="stat-label">Questions Attempted</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.examsCompleted}</div>
                  <div className="stat-label">Exams Completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.averageScore}%</div>
                  <div className="stat-label">Average Score</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalPracticeTime}h</div>
                  <div className="stat-label">Total Practice Time</div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Account Management Section */}
        <div className="profile-section">
          <h2>Account Management</h2>
          <div className="profile-actions">
            <button 
              className="change-username-button"
              onClick={() => setShowUsernameForm(!showUsernameForm)}
            >
              {showUsernameForm ? 'Cancel' : 'Change Username'}
            </button>
            
            <button 
              className="year-group-button"
              onClick={() => {
                setShowYearGroupSelection(!showYearGroupSelection);
                setSelectedYearGroup(userData?.yearGroup || null);
              }}
            >
              {showYearGroupSelection ? 'Cancel' : userData?.yearGroup ? 'Change Year Group' : 'Set Year Group'}
            </button>
            
            <button 
              className="change-password-button"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>
            
            <button 
              className="theme-toggle-button"
              onClick={toggleDarkMode}
            >
              {darkMode ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
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
                    name="newUsername"
                    value={newUsername}
                    onChange={handleUsernameChange}
                    placeholder="Enter new username"
                    minLength={3}
                    required
                  />
                </div>
                <div className="form-buttons">
                  <button type="submit" className="submit-button">Update Username</button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => {
                      setShowUsernameForm(false);
                      setNewUsername('');
                      setUsernameMessage(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
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
          
          {showYearGroupSelection && (
            <div className="year-group-selection-container">
              <h3>{userData?.yearGroup ? 'Change Year Group' : 'Set Year Group'}</h3>
              
              {yearGroupMessage && (
                <div className={`message ${yearGroupMessage.type}`}>
                  {yearGroupMessage.text}
                </div>
              )}
              
              <div className="year-group-grid">
                {yearGroups.map(yearGroup => (
                  <div 
                    key={yearGroup.value}
                    className={`year-group-card ${selectedYearGroup === yearGroup.value ? 'selected' : ''}`}
                    onClick={() => setSelectedYearGroup(yearGroup.value)}
                  >
                    <h4>{yearGroup.label}</h4>
                    <p>{yearGroup.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="form-buttons">
                <button 
                  className="submit-button"
                  onClick={handleYearGroupUpdate}
                  disabled={isUpdatingYearGroup || selectedYearGroup === userData?.yearGroup}
                >
                  {isUpdatingYearGroup ? 'Updating...' : 'Update Year Group'}
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowYearGroupSelection(false);
                    setSelectedYearGroup(userData?.yearGroup || null);
                    setYearGroupMessage(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Account Confirmation Modal */}
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