import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { wellbeingService } from '../services/api';
import '../styles/WellbeingSuite.css';
import logger from '../utils/logger';

interface WellbeingSummary {
  averageMood: number;
  totalStudyHours: number;
  recentMoodRatings: {
    _id: string;
    moodValue: number;
    timestamp: string;
  }[];
  recentJournalEntries: {
    _id: string;
    entryText: string;
    timestamp: string;
    tags?: string[];
  }[];
}

interface WellbeingApiResponse {
  data: {
    averageMood: number;
    totalStudyHours: number;
    recentMoodRatings: {
      _id: string;
      moodValue: number;
      timestamp: string;
    }[];
    recentJournalEntries: {
      _id: string;
      entryText: string;
      timestamp: string;
      tags?: string[];
    }[];
    journalCount: number;
    streak: number;
  };
  usingMockData?: boolean;
}

const WellbeingSuite: React.FC = () => {
  const { currentUser } = useAuth();
  const [timeframe, setTimeframe] = useState('week');
  const [summary, setSummary] = useState<WellbeingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Fetch wellbeing summary
  useEffect(() => {
    const fetchSummary = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await wellbeingService.getWellbeingSummary(timeframe) as WellbeingApiResponse;
        setSummary(response.data);
        // Set the mock data flag based on the API response
        setUsingMockData(response.usingMockData || false);
      } catch (err) {
        logger.error('Error fetching wellbeing summary:', err);
        setError('Failed to load wellbeing data. Please try again later.');
        setUsingMockData(true); // Assume mock data if there was an error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSummary();
  }, [currentUser, timeframe]);

  // Get emoji for mood value
  const getMoodEmoji = (moodValue: number) => {
    const emojis: Record<number, string> = {
      1: '😞', // Frustrated
      2: '😕', // Confused
      3: '😐', // Neutral
      4: '🙂', // Satisfied
      5: '😄'  // Happy
    };
    
    return emojis[moodValue] || '❓';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="wellbeing-container">
      <div className="wellbeing-header">
        <h1>Your Wellbeing Dashboard</h1>
        <div className="timeframe-selector">
          <label htmlFor="timeframe">Data from: </label>
          <select 
            id="timeframe" 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="1week">Past Week</option>
            <option value="1month">Past Month</option>
            <option value="3months">Past 3 Months</option>
            <option value="6months">Past 6 Months</option>
            <option value="1year">Past Year</option>
          </select>
        </div>
      </div>
      
      {/* Add mock data indicator */}
      {usingMockData && (
        <div className="mock-data-indicator">
          <p>⚠️ Using mock wellbeing data. Some features may be limited.</p>
        </div>
      )}

      {isLoading ? (
        <div className="loading-message">Loading wellbeing data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : !summary ? (
        <div className="empty-message">No wellbeing data available.</div>
      ) : (
        <div className="wellbeing-content">
          <div className="wellbeing-stats">
            <div className="stat-card mood-stat">
              <h2>Average Mood</h2>
              <div className="mood-display">
                <span className="mood-emoji">{getMoodEmoji(Math.round(summary.averageMood))}</span>
                <span className="mood-value">{summary.averageMood.toFixed(1)}/5</span>
              </div>
            </div>
            
            <div className="stat-card hours-stat">
              <h2>Study Hours</h2>
              <div className="hours-display">
                <span className="hours-value">{summary.totalStudyHours}</span>
                <span className="hours-label">hours</span>
              </div>
            </div>
          </div>
          
          <div className="wellbeing-sections">
            <div className="section recent-moods">
              <h2>Recent Mood Ratings</h2>
              {summary.recentMoodRatings.length === 0 ? (
                <p className="empty-section">No mood ratings recorded yet.</p>
              ) : (
                <ul className="mood-list">
                  {summary.recentMoodRatings.map(rating => (
                    <li key={rating._id} className="mood-item">
                      <span className="mood-emoji">{getMoodEmoji(rating.moodValue)}</span>
                      <span className="mood-date">{formatDate(rating.timestamp)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="section recent-entries">
              <h2>Recent Journal Entries</h2>
              {summary.recentJournalEntries.length === 0 ? (
                <p className="empty-section">No journal entries yet.</p>
              ) : (
                <ul className="entries-list">
                  {summary.recentJournalEntries.map(entry => (
                    <li key={entry._id} className="entry-item">
                      <span className="entry-date">{formatDate(entry.timestamp)}</span>
                      <p className="entry-text">{truncateText(entry.entryText, 100)}</p>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/journal" className="view-all-link">View All Journal Entries</Link>
            </div>
          </div>
          
          <div className="wellbeing-actions">
            <Link to="/journal" className="action-button journal-button">
              Write in Journal
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellbeingSuite; 