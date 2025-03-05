import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSafeAuth } from '../hooks/useSafeAuth';
import { withAuthAndErrorBoundary } from '../components/withAuth';
import ErrorBoundary from '../components/ErrorBoundary';
import { getPersonalizedWelcomeMessage } from '../utils/messageUtils';
import StudyScheduleCard from '../components/StudyScheduleCard';
import SubjectCard from '../components/SubjectCard';
import { onboardingService } from '../services/api';
import { Subject } from '../types';
import '../styles/Home.css';
import logger from '../utils/logger';

// Main component that uses auth directly
const HomeComponent: React.FC = () => {
  // Use the safe auth hook that won't throw errors
  const { isAuthenticated, currentUser, isMockAuth, _contextInfo } = useSafeAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // Log authentication state for debugging
  useEffect(() => {
    logger.info('Home component auth state:', { 
      isAuthenticated, 
      hasUser: !!currentUser, 
      isMockAuth,
      contextInfo: _contextInfo
    });
  }, [isAuthenticated, currentUser, isMockAuth, _contextInfo]);
  
  // Fetch subjects when user is authenticated and has a year group
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.yearGroup) {
      fetchSubjects(Number(currentUser.yearGroup));
    }
  }, [isAuthenticated, currentUser]);
  
  // Set a random welcome message when component mounts
  useEffect(() => {
    // Array of welcome messages
    const welcomeMessages = [
      // Time-based greetings
      `${getTimeBasedGreeting()}, ${currentUser?.username || 'Student'}!`,
      // Motivational messages
      `Ready to excel today, ${currentUser?.username || 'Student'}?`,
      `Let's make today productive, ${currentUser?.username || 'Student'}!`,
      `Time to boost your knowledge, ${currentUser?.username || 'Student'}!`,
      // Question-based engagement
      `What will you learn today, ${currentUser?.username || 'Student'}?`,
      // Achievement-focused
      `You're making great progress, ${currentUser?.username || 'Student'}!`,
      // Day-specific
      `Happy ${getDayName()}, ${currentUser?.username || 'Student'}!`,
      // Random fun messages
      `Learning is your superpower, ${currentUser?.username || 'Student'}!`,
      `Every question gets you closer to mastery, ${currentUser?.username || 'Student'}!`,
      `Knowledge is the key to success, ${currentUser?.username || 'Student'}!`
    ];
    
    // Select a random welcome message
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setWelcomeMessage(welcomeMessages[randomIndex]);
  }, [currentUser]); // Only update when user changes
  
  // Function to fetch subjects based on year group
  const fetchSubjects = async (yearGroup: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await onboardingService.getSubjectsForYearGroup(yearGroup);
      
      if (response && response.subjects) {
        setSubjects(response.subjects);
      } else {
        setError('Unable to load subjects for your year group');
      }
    } catch (err) {
      logger.error('Error fetching subjects:', err);
      setError('Unable to load subjects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get time-based greeting
  function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
  
  // Helper function to get current day name
  function getDayName() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1 className="welcome-message">{welcomeMessage}</h1>
      </section>
      
      <div className="navigation-button-container">
        <Link to="/features" className="nav-button">
          Navigate
        </Link>
      </div>
      
      <section className="subjects-section">
        <div className="section-header">
          {currentUser?.userType === 'teacher' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="add-subject-button"
            >
              Add Subject
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading subjects...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>Error loading subjects. Please try again later.</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="no-subjects-message">
            <p>No subjects found. {currentUser?.userType === 'teacher' ? 'Add a subject to get started!' : 'Your subjects will appear here once you enroll.'}</p>
          </div>
        ) : (
          <div className="subjects-grid">
            {subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </section>
      
      {/* Show study plan card for all authenticated users */}
      {isAuthenticated && (
        <div className="featured-section">
          <h2>Your Study Plan</h2>
          <div className="featured-card-container">
            <StudyScheduleCard />
          </div>
        </div>
      )}
      
      {/* Modal for adding new subject - display when isModalOpen is true */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Subject</h2>
            {/* Add subject form would go here */}
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Default export using higher-order component for authentication and error handling
export default withAuthAndErrorBoundary(HomeComponent); 