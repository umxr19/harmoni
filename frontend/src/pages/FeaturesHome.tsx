import React from 'react';
import { Link } from 'react-router-dom';
import { useSafeAuth } from '../hooks/useSafeAuth';
import { withAuthAndErrorBoundary } from '../components/withAuth';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/Home.css';

// Main component that uses auth directly
const FeaturesHomeComponent: React.FC = () => {
  // Use the safe auth hook that won't throw errors
  const { isAuthenticated, currentUser } = useSafeAuth();
  
  return (
    <div className="home-container">
      <div className="hero-section features-hero">
        <h1>Harmoni Features</h1>
        <p className="hero-subtitle">Explore all the features available in Harmoni</p>
      </div>
      
      <div className="app-sections">
        <div className="app-sections-grid">
          <Link to="/dashboard" className="app-section-card">
            <div className="app-section-icon">📊</div>
            <h3>Dashboard</h3>
            <p>View your progress and performance analytics</p>
          </Link>
          
          <Link to="/study-schedule" className="app-section-card">
            <div className="app-section-icon">📚</div>
            <h3>Study Schedule</h3>
            <p>Create and manage your personalized study plan</p>
          </Link>
          
          <Link to="/practice" className="app-section-card">
            <div className="app-section-icon">📝</div>
            <h3>Practice</h3>
            <p>Access thousands of practice questions by topic</p>
          </Link>
          
          <Link to="/exams" className="app-section-card">
            <div className="app-section-icon">🎯</div>
            <h3>Exams</h3>
            <p>Take full-length practice exams with timed sessions</p>
          </Link>
          
          <Link to="/wellbeing" className="app-section-card">
            <div className="app-section-icon">🧠</div>
            <h3>Wellbeing</h3>
            <p>Track your mood and maintain balance with wellbeing tools</p>
          </Link>
          
          {currentUser && currentUser.role === 'student' && (
            <Link to="/classrooms" className="app-section-card">
              <div className="app-section-icon">👨‍🏫</div>
              <h3>Classrooms</h3>
              <p>Access your assigned classrooms and homework</p>
            </Link>
          )}
          
          {currentUser && currentUser.role === 'teacher' && (
            <Link to="/classrooms" className="app-section-card">
              <div className="app-section-icon">👨‍🏫</div>
              <h3>Classrooms</h3>
              <p>Manage your classrooms and student assignments</p>
            </Link>
          )}
          
          <Link to="/store" className="app-section-card">
            <div className="app-section-icon">🛒</div>
            <h3>Store</h3>
            <p>Browse and purchase additional educational resources</p>
          </Link>
        </div>
      </div>
      
      <div className="back-to-home-container">
        <Link to="/" className="back-button">
          &larr; Back to Subjects
        </Link>
      </div>
    </div>
  );
};

// Default export using higher-order component for authentication and error handling
export default withAuthAndErrorBoundary(FeaturesHomeComponent); 