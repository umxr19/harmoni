import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logger from '../utils/logger';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { currentUser, isLoading, isMockAuth } = useAuth();

  if (isMockAuth) {
    logger.info('Using mock auth in AdminRoute');
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default AdminRoute; 