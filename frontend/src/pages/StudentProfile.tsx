import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authService, questionService, userService } from '../services/api';
import { User } from '../types';
import '../styles/StudentProfile.css';
import logger from '../utils/logger';

interface UserStats {
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
}

interface RecentActivity {
  date: string;
  action: string;
  result?: string;
  questionId?: string;
}

export const StudentProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile using the authService
        const userResponse = await authService.getProfile();
        setUser(userResponse.data);

        // Fetch user stats
        try {
          const statsResponse = await userService.getUserStats();
          setStats(statsResponse.data as UserStats);
          
          // Fetch user activity
          const activityResponse = await userService.getUserActivity(10);
          setRecentActivity(activityResponse.data as RecentActivity[]);
          
          // Fetch recommendations (if needed)
          const recommendationsResponse = await userService.getRecommendations();
          setRecommendations(recommendationsResponse.data as any[]);
        } catch (error) {
          logger.info('Error fetching user data, using mock data instead', error);
          // Use mock data as fallback
          // ...
        }
      } catch (error) {
        logger.error('Failed to fetch profile data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="student-profile-container">
      <div className="profile-header">
        <div className="avatar-container">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Profile" className="avatar" />
          ) : (
            <div className="avatar-placeholder">
              {user?.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="user-info">
          <h1>{user?.username}</h1>
          <p className="user-email">{user?.email}</p>
          <p className="user-role">Role: {user?.role}</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'progress' ? 'active' : ''} 
          onClick={() => setActiveTab('progress')}
        >
          Progress
        </button>
        <button 
          className={activeTab === 'activity' ? 'active' : ''} 
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''} 
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-cards">
              <div className="stat-card">
                <h3>Questions Attempted</h3>
                <p className="stat-value">{stats?.totalAttempts || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Success Rate</h3>
                <p className="stat-value">{stats?.accuracy.toFixed(1) || 0}%</p>
              </div>
              <div className="stat-card">
                <h3>Correct Answers</h3>
                <p className="stat-value">{stats?.correctAnswers || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Avg. Time per Question</h3>
                <p className="stat-value">{stats?.averageTime.toFixed(1) || 0}s</p>
              </div>
            </div>

            <div className="recent-activity-preview">
              <h2>Recent Activity</h2>
              {recentActivity.length > 0 ? (
                <ul className="activity-list">
                  {recentActivity.slice(0, 3).map((activity, index) => (
                    <li key={index} className="activity-item">
                      <span className="activity-date">{new Date(activity.date).toLocaleDateString()}</span>
                      <span className="activity-description">{activity.action}</span>
                      {activity.result && (
                        <span className={`activity-result ${activity.result === 'Correct' ? 'correct' : 'incorrect'}`}>
                          {activity.result}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recent activity</p>
              )}
              <button className="view-all-btn" onClick={() => setActiveTab('activity')}>
                View All Activity
              </button>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="progress-section">
            <h2>Progress by Category</h2>
            <div className="category-progress">
              <div className="category-item">
                <div className="category-header">
                  <h3>Verbal Reasoning</h3>
                  <span className="progress-percentage">75%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
                <div className="category-stats">
                  <span>15/20 questions correct</span>
                </div>
              </div>
              
              <div className="category-item">
                <div className="category-header">
                  <h3>Non-verbal Reasoning</h3>
                  <span className="progress-percentage">60%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '60%' }}></div>
                </div>
                <div className="category-stats">
                  <span>12/20 questions correct</span>
                </div>
              </div>
              
              <div className="category-item">
                <div className="category-header">
                  <h3>Mathematics</h3>
                  <span className="progress-percentage">85%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '85%' }}></div>
                </div>
                <div className="category-stats">
                  <span>17/20 questions correct</span>
                </div>
              </div>
              
              <div className="category-item">
                <div className="category-header">
                  <h3>English</h3>
                  <span className="progress-percentage">70%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '70%' }}></div>
                </div>
                <div className="category-stats">
                  <span>14/20 questions correct</span>
                </div>
              </div>
            </div>
            
            <div className="recommended-practice">
              <h2>Recommended Practice</h2>
              <div className="recommendation-cards">
                <div className="recommendation-card">
                  <h3>Non-verbal Reasoning</h3>
                  <p>Improve your pattern recognition skills</p>
                  <Link to="/questions?category=non-verbal-reasoning" className="practice-btn">
                    Practice Now
                  </Link>
                </div>
                <div className="recommendation-card">
                  <h3>English Comprehension</h3>
                  <p>Work on your reading comprehension</p>
                  <Link to="/questions?category=english-comprehension" className="practice-btn">
                    Practice Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-section">
            <h2>Recent Activity</h2>
            {recentActivity.length > 0 ? (
              <div className="activity-timeline">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-date">
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                    <div className="timeline-content">
                      <p className="activity-description">{activity.action}</p>
                      {activity.result && (
                        <span className={`activity-result ${activity.result === 'Correct' ? 'correct' : 'incorrect'}`}>
                          {activity.result}
                        </span>
                      )}
                      {activity.questionId && (
                        <Link to={`/questions/${activity.questionId}`} className="question-link">
                          View Question
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-activity">No activity recorded yet. Start practicing to see your activity here!</p>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2>Account Settings</h2>
            
            <div className="settings-card">
              <h3>Profile Information</h3>
              <form className="settings-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input type="text" id="username" defaultValue={user?.username} />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" defaultValue={user?.email} />
                </div>
                <button type="submit" className="save-btn">Save Changes</button>
              </form>
            </div>
            
            <div className="settings-card">
              <h3>Change Password</h3>
              <form className="settings-form">
                <div className="form-group">
                  <label htmlFor="current-password">Current Password</label>
                  <input type="password" id="current-password" />
                </div>
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input type="password" id="new-password" />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <input type="password" id="confirm-password" />
                </div>
                <button type="submit" className="save-btn">Update Password</button>
              </form>
            </div>
            
            <div className="settings-card">
              <h3>Notification Preferences</h3>
              <div className="notification-options">
                <div className="notification-option">
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                  <div className="notification-text">
                    <p>Email Notifications</p>
                    <span>Receive updates about new questions and features</span>
                  </div>
                </div>
                <div className="notification-option">
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                  <div className="notification-text">
                    <p>Study Reminders</p>
                    <span>Get reminders to practice regularly</span>
                  </div>
                </div>
              </div>
              <button className="save-btn">Save Preferences</button>
            </div>
            
            <div className="settings-card danger-zone">
              <h3>Danger Zone</h3>
              <p>Once you delete your account, there is no going back. Please be certain.</p>
              <button className="delete-account-btn">Delete Account</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 