import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { studyScheduleService } from '../services/api';
import { WeeklySchedule, DailySchedule, StudySchedulePreferences } from '../types';
import { MoodRatingModal } from '../components/MoodRatingModal';
import '../styles/StudySchedule.css';
import logger from '../utils/logger';

const StudySchedule: React.FC = () => {
  const { currentUser } = useAuth();
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DailySchedule | null>(null);
  const [showMoodModal, setShowMoodModal] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<StudySchedulePreferences | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(false);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  useEffect(() => {
    fetchSchedule();
    fetchPreferences();
  }, []);

  const fetchSchedule = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const response = await studyScheduleService.getCurrentSchedule();
      setSchedule(response.data);
      setUsingMockData(response.usingMockData || false);
      
      // Store in localStorage for persistence in mock environment
      if (response.usingMockData) {
        localStorage.setItem('currentStudySchedule', JSON.stringify(response.data));
      }
    } catch (err) {
      logger.error('Error fetching study schedule:', err);
      setError('Failed to load study schedule. Please try again later.');
      
      // Try to load from localStorage if available
      const storedSchedule = localStorage.getItem('currentStudySchedule');
      if (storedSchedule) {
        try {
          setSchedule(JSON.parse(storedSchedule));
          setUsingMockData(true);
        } catch (e) {
          logger.error('Error parsing stored schedule:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    if (!currentUser) return;

    try {
      const response = await studyScheduleService.getSchedulePreferences();
      setPreferences(response.data);
    } catch (err) {
      logger.error('Error fetching preferences:', err);
    }
  };

  const handleRegenerateSchedule = async () => {
    setRegenerating(true);
    try {
      const response = await studyScheduleService.generateWeeklySchedule(preferences);
      setSchedule(response.data);
      setUsingMockData(response.usingMockData || false);
      
      // Store in localStorage for persistence in mock environment
      if (response.usingMockData) {
        localStorage.setItem('currentStudySchedule', JSON.stringify(response.data));
      }
    } catch (err) {
      logger.error('Error regenerating schedule:', err);
      setError('Failed to regenerate schedule. Please try again later.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDayClick = (day: DailySchedule) => {
    setSelectedDay(day);
  };

  const handleMarkCompleted = () => {
    if (!selectedDay) return;
    
    // Show mood rating modal
    setShowMoodModal(true);
  };

  const handleMoodSubmit = async (moodValue: number) => {
    if (!selectedDay) return;
    
    try {
      const response = await studyScheduleService.markDayCompleted(selectedDay.date, moodValue);
      
      // Update the local schedule
      if (schedule && response.data.schedule) {
        setSchedule(response.data.schedule);
      } else {
        // If no updated schedule is returned, update locally
        const updatedDays = schedule!.days.map(day => {
          if (day.date === selectedDay.date) {
            return { ...day, completed: true, mood: moodValue };
          }
          return day;
        });
        
        setSchedule({
          ...schedule!,
          days: updatedDays
        });
      }
      
      // Update selected day
      setSelectedDay({ ...selectedDay, completed: true, mood: moodValue });
      
      // Close the mood modal
      setShowMoodModal(false);
    } catch (err) {
      logger.error('Error marking day as completed:', err);
      setError('Failed to mark day as completed. Please try again later.');
      setShowMoodModal(false);
    }
  };

  const handleMoodCancel = () => {
    setShowMoodModal(false);
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getTodayLabel = (day: DailySchedule) => {
    return isToday(day.date) ? ' (Today)' : '';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#4ade80'; // green
      case 'medium':
        return '#facc15'; // yellow
      case 'hard':
        return '#f87171'; // red
      default:
        return '#a3a3a3'; // gray
    }
  };

  const getTopicDurationLabel = (minutes: number) => {
    return `${minutes} min`;
  };

  // Determine if high mood adaptations should be shown (extra challenge)
  const shouldShowHighMoodAdaptation = (day: DailySchedule) => {
    // Check if user has a high mood rating (4-5)
    return day.mood && day.mood >= 4 && !day.isRestDay;
  };

  // Determine if low mood adaptations should be shown (reduced workload)
  const shouldShowLowMoodAdaptation = (day: DailySchedule) => {
    // Check if user has a low mood rating (1-2)
    return day.mood && day.mood <= 2 && !day.isRestDay;
  };

  if (loading) {
    return (
      <div className="study-schedule-container loading">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / Study Schedule
        </div>
        <h2>Loading Study Schedule...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="study-schedule-container error">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / Study Schedule
        </div>
        <h2>Error Loading Study Schedule</h2>
        <p className="error-message">{error}</p>
        <button 
          className="retry-button"
          onClick={fetchSchedule}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="study-schedule-container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / Study Schedule
      </div>
    
      <div className="schedule-header">
        <div>
          <h2>Your Study Schedule</h2>
          {schedule && (
            <p className="schedule-date-range">
              Week of {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
            </p>
          )}
        </div>
        <button 
          className="regenerate-button"
          onClick={handleRegenerateSchedule}
          disabled={regenerating}
        >
          {regenerating ? 'Regenerating...' : 'Regenerate Schedule'}
        </button>
      </div>
      
      {usingMockData && (
        <div className="mock-data-notice">
          <p>Using mock data for demonstration. In production, this would connect to your actual study data.</p>
        </div>
      )}
      
      {schedule && (
        <div className="schedule-content">
          <div className="days-list">
            {schedule.days.map((day) => (
              <div 
                key={day.date}
                className={`day-card ${day.isRestDay ? 'rest-day' : ''} ${day.completed ? 'completed' : ''} ${isToday(day.date) ? 'today' : ''} ${selectedDay?.date === day.date ? 'selected' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                <h3>
                  {day.day}{getTodayLabel(day)}
                  {day.completed && <span className="completed-badge">✓</span>}
                </h3>
                <p className="date">{formatDate(day.date)}</p>
                
                {day.isRestDay ? (
                  <p className="rest-day-label">Rest Day</p>
                ) : (
                  <>
                    <p className="topics-count">{day.topics.length} Topics • {day.totalDuration} min</p>
                    {day.completed && day.mood && (
                      <p className="mood-indicator">Mood: {getMoodEmoji(day.mood)}</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          
          {selectedDay && (
            <div className="day-detail">
              <div className="day-header">
                <h3>{selectedDay.day} • {formatDate(selectedDay.date)}</h3>
                {selectedDay.completed ? (
                  <div className="completion-status">
                    <span className="completed-label">Completed</span>
                    {selectedDay.mood && (
                      <span className="mood-display">Mood: {getMoodEmoji(selectedDay.mood)}</span>
                    )}
                  </div>
                ) : !selectedDay.isRestDay && (
                  <button 
                    className="complete-button"
                    onClick={handleMarkCompleted}
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
              
              {selectedDay.isRestDay ? (
                <div className="rest-day-info">
                  <h4>Rest Day</h4>
                  <p>Take a break from structured studying today. Rest is an important part of the learning process!</p>
                  <p className="motivational-message">{selectedDay.motivationalMessage}</p>
                </div>
              ) : (
                <div className="study-day-info">
                  <h4>Study Topics</h4>
                  <div className="topics-list">
                    {selectedDay.topics.map((topic) => (
                      <div key={topic.id} className="topic-card">
                        <div className="topic-header">
                          <h5>{topic.name}</h5>
                          <span 
                            className="difficulty-badge"
                            style={{ backgroundColor: getDifficultyColor(topic.difficulty) }}
                          >
                            {topic.difficulty}
                          </span>
                        </div>
                        <p className="topic-category">{topic.category}</p>
                        <p className="topic-description">{topic.description}</p>
                        <div className="topic-footer">
                          <span className="duration-badge">
                            {getTopicDurationLabel(topic.recommendedDuration)}
                          </span>
                          {topic.userPerformance !== undefined && (
                            <span className="performance-badge">
                              Performance: {topic.userPerformance}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedDay.motivationalMessage && (
                    <div className="motivational-message-container">
                      <p className="motivational-message">{selectedDay.motivationalMessage}</p>
                    </div>
                  )}
                  
                  {/* Mood-based adaptations */}
                  {shouldShowHighMoodAdaptation(selectedDay) && (
                    <div className="adaptation high-mood">
                      <h4>Challenge Extension</h4>
                      <p>You're feeling great today! Consider these additional challenges:</p>
                      <ul>
                        <li>Try 2-3 additional practice questions for each topic</li>
                        <li>Extend your study session by 10-15 minutes</li>
                        <li>Attempt a slightly more difficult problem than usual</li>
                      </ul>
                    </div>
                  )}
                  
                  {shouldShowLowMoodAdaptation(selectedDay) && (
                    <div className="adaptation low-mood">
                      <h4>Gentle Approach</h4>
                      <p>Taking care of your wellbeing is important. Consider these adjustments:</p>
                      <ul>
                        <li>Reduce today's session to 30 minutes instead of the full hour</li>
                        <li>Focus on just one topic that you enjoy more</li>
                        <li>Take more frequent breaks (5 minutes every 15 minutes)</li>
                        <li>Try a different learning method like watching a video instead of reading</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {showMoodModal && (
        <MoodRatingModal 
          onSubmit={handleMoodSubmit}
          onCancel={handleMoodCancel}
          context="study"
        />
      )}
    </div>
  );
};

export default StudySchedule; 