import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studyScheduleService } from '../services/api';
import { WeeklySchedule } from '../types/index';
import '../styles/StudyScheduleCard.css';
import logger from '../utils/logger';

const StudyScheduleCard: React.FC = () => {
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await studyScheduleService.getCurrentSchedule();
      setSchedule(response.data);
    } catch (err) {
      logger.error('Error fetching study schedule:', err);
      setError('Failed to load schedule');
      
      // Try to load from localStorage if available
      const storedSchedule = localStorage.getItem('currentStudySchedule');
      if (storedSchedule) {
        try {
          setSchedule(JSON.parse(storedSchedule));
        } catch (e) {
          logger.error('Error parsing stored schedule:', e);
        }
      }
    } finally {
      setLoading(false);
    }
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

  const getTodaySchedule = () => {
    if (!schedule) return null;
    
    return schedule.days.find(day => isToday(day.date)) || null;
  };

  const getUpcomingDay = () => {
    if (!schedule) return null;
    
    const today = new Date();
    return schedule.days.find(day => {
      const date = new Date(day.date);
      return date > today && !day.completed;
    }) || null;
  };

  const getDayToShow = () => {
    const todaySchedule = getTodaySchedule();
    if (todaySchedule && !todaySchedule.completed) return todaySchedule;
    
    return getUpcomingDay() || getTodaySchedule() || null;
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

  if (loading) {
    return (
      <div className="study-schedule-card loading">
        <h3>Study Schedule</h3>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="study-schedule-card error">
        <h3>Study Schedule</h3>
        <p className="error-message">Couldn't load schedule</p>
        <Link to="/study-schedule" className="view-full-schedule">
          View Full Schedule
        </Link>
      </div>
    );
  }

  const dayToShow = getDayToShow();

  return (
    <div className="study-schedule-card">
      <div className="card-header">
        <h3>Study Schedule</h3>
        <Link to="/study-schedule" className="view-full-schedule">
          View Full Schedule
        </Link>
      </div>
      
      {dayToShow ? (
        <div className={`day-preview ${dayToShow.isRestDay ? 'rest-day' : ''} ${isToday(dayToShow.date) ? 'today' : ''}`}>
          <div className="day-preview-header">
            <h4>
              {isToday(dayToShow.date) ? 'Today' : 'Next Up'}: {dayToShow.day}
              <span className="preview-date">{formatDate(dayToShow.date)}</span>
            </h4>
            {dayToShow.completed && (
              <div className="preview-completion">
                <span className="completed-badge">✓</span>
                {dayToShow.mood && (
                  <span className="preview-mood">{getMoodEmoji(dayToShow.mood)}</span>
                )}
              </div>
            )}
          </div>
          
          {dayToShow.isRestDay ? (
            <p className="rest-day-preview">Rest Day - Take a break!</p>
          ) : (
            <div className="topics-preview">
              <p className="topics-summary">
                <strong>{dayToShow.topics.length} Topics</strong> • {dayToShow.totalDuration} min
              </p>
              <div className="topics-list-preview">
                {dayToShow.topics.slice(0, 2).map((topic) => (
                  <div key={topic.id} className="topic-preview">
                    <span className="topic-name">{topic.name}</span>
                    <span className="topic-duration">{topic.recommendedDuration} min</span>
                  </div>
                ))}
                {dayToShow.topics.length > 2 && (
                  <p className="more-topics">+{dayToShow.topics.length - 2} more topics</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-schedule">
          <p>No upcoming study sessions found.</p>
          <Link to="/study-schedule" className="generate-schedule-link">
            Generate Schedule
          </Link>
        </div>
      )}
    </div>
  );
};

export default StudyScheduleCard; 