import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logger from '../utils/logger';

interface ProtectedRouteProps {
    children: React.ReactElement;
    roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
    const { currentUser, isLoading, isMockAuth } = useAuth();

    if (isMockAuth) {
        logger.info('Using mock auth in ProtectedRoute');
    }

    if (isLoading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Check if the user has the required role
    if (roles && !roles.includes(currentUser.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}; 