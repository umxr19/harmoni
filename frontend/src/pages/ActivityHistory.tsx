import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { progressService } from '../services/api';
import '../styles/ActivityHistory.css';
import logger from '../utils/logger';

export const ActivityHistory: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await progressService.getUserActivity(50); // Get more activities
        setActivities(response.data);
      } catch (err) {
        logger.error('Failed to fetch activity history:', err);
        setError('Failed to load activity history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  if (loading) return <div className="loading-spinner">Loading activity history...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="activity-history-container">
      <div className="activity-header">
        <h1>Activity History</h1>
        <div className="filter-controls">
          <button 
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-button ${filter === 'practice' ? 'active' : ''}`}
            onClick={() => setFilter('practice')}
          >
            Practice
          </button>
          <button 
            className={`filter-button ${filter === 'exam' ? 'active' : ''}`}
            onClick={() => setFilter('exam')}
          >
            Exams
          </button>
          <button 
            className={`filter-button ${filter === 'question' ? 'active' : ''}`}
            onClick={() => setFilter('question')}
          >
            Questions
          </button>
        </div>
      </div>
      
      <div className="activity-list">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-type-badge">{activity.type}</div>
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
              {activity.id && (
                <Link to={`/${activity.type}/${activity.id}`} className="view-link">
                  View Details
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="no-data-message">
            No activities found for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}; 