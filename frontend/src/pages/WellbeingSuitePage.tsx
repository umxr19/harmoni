import React from 'react';
import { useAuth } from '../hooks/useAuth';
import WellbeingSuite from '../components/WellbeingSuite';
import { Navigate } from 'react-router-dom';

const WellbeingSuitePage: React.FC = () => {
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
      <WellbeingSuite />
    </div>
  );
};

export default WellbeingSuitePage; 