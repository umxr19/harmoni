import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSafeAuth } from '../hooks/useSafeAuth';
import { progressService } from '../services/api';
import { ProgressCharts } from '../components/ProgressCharts';
import '../styles/ParentDashboard.css';
import logger from '../utils/logger';

interface Child {
  id: string;
  name: string;
  email: string;
  lastActive: string;
}

export const ParentDashboard: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [childStats, setChildStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useSafeAuth();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const response = await progressService.getParentChildren();
        setChildren(response.data);
        
        // If there are children, select the first one by default
        if (response.data.length > 0) {
          setSelectedChild(response.data[0].id);
        }
      } catch (err) {
        logger.error('Failed to fetch children:', err);
        setError('Failed to load your children\'s data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  useEffect(() => {
    if (!selectedChild) return;

    const fetchChildData = async () => {
      try {
        setLoading(true);
        
        // Fetch child's progress stats
        const statsResponse = await progressService.getChildProgress(selectedChild);
        setChildStats(statsResponse.data);
        
        // Fetch child's recent activity
        const activityResponse = await progressService.getChildRecentActivity(selectedChild);
        setRecentActivity(activityResponse.data);
        
      } catch (err) {
        logger.error('Failed to fetch child data:', err);
        setError('Failed to load child data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChildData();
  }, [selectedChild]);

  const handleChildChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChild(e.target.value);
  };

  if (loading && !selectedChild) {
    return <div className="loading-spinner">Loading dashboard...</div>;
  }

  if (children.length === 0) {
    return (
      <div className="parent-dashboard-container">
        <div className="dashboard-header">
          <h1>Parent Dashboard</h1>
          <p className="welcome-message">Welcome, {currentUser?.username}</p>
        </div>
        
        <div className="no-children-message">
          <h2>No children linked to your account</h2>
          <p>To monitor your child's progress, you need to link their account to yours.</p>
          <Link to="/link-child" className="link-child-button">Link Child Account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-dashboard-container">
      <div className="dashboard-header">
        <h1>Parent Dashboard</h1>
        <p className="welcome-message">Welcome, {currentUser?.username}</p>
      </div>

      <div className="child-selector">
        <label htmlFor="child-select">Select Child:</label>
        <select 
          id="child-select" 
          value={selectedChild || ''} 
          onChange={handleChildChange}
        >
          {children.map(child => (
            <option key={child.id} value={child.id}>{child.name}</option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading child data...</div>
      ) : (
        <div className="dashboard-content">
          {childStats ? (
            <>
              <div className="dashboard-section">
                <div className="section-header">
                  <h2>Progress Overview</h2>
                </div>
                
                <ProgressCharts 
                  categoryData={childStats.categoryData}
                  timeData={childStats.timeData}
                  strengthData={childStats.strengthData}
                  timeSpentData={childStats.timeSpentData}
                />
              </div>

              <div className="dashboard-section">
                <div className="section-header">
                  <h2>Recent Activity</h2>
                </div>
                
                <div className="activity-list">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-info">
                          <div className="activity-title">{activity.title}</div>
                          <div className="activity-date">{new Date(activity.date).toLocaleString()}</div>
                        </div>
                        {activity.score !== undefined && (
                          <div className="activity-score">
                            <div className="score-value">{activity.score}%</div>
                            <div className="score-detail">{activity.correct}/{activity.total} correct</div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-data-message">No recent activity for this child.</div>
                  )}
                </div>
              </div>

              <div className="dashboard-section">
                <div className="section-header">
                  <h2>Upcoming Assignments</h2>
                </div>
                
                <div className="assignments-list">
                  {childStats.assignments && childStats.assignments.length > 0 ? (
                    childStats.assignments
                      .filter((a: any) => !a.completed)
                      .map((assignment: any, index: number) => (
                        <div key={index} className="assignment-item">
                          <div className="assignment-info">
                            <div className="assignment-title">{assignment.title}</div>
                            <div className="assignment-details">
                              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                              <span>Status: Pending</span>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="no-data-message">No upcoming assignments.</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="no-data-message">No data available for this child yet.</div>
          )}

          <div className="dashboard-actions">
            <Link to="/link-child" className="dashboard-button link">
              Link Another Child
            </Link>
            <Link to="/reports" className="dashboard-button report">
              Generate Report
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}; 