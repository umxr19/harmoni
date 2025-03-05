import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Journal from '../components/Journal';
import { Navigate } from 'react-router-dom';

const JournalPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="page-container">
      <Journal />
    </div>
  );
};

export default JournalPage; 