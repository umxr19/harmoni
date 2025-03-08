import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { withAuthAndErrorBoundary } from './withAuth';
import '../styles/Header.css';
import '../styles/MobileHeader.css';
import logger from '../utils/logger';

export const HeaderComponent: React.FC = () => {
  // Use the auth hook
  const { currentUser, logout, isMockAuth } = useAuth();
  
  if (isMockAuth) {
    logger.info('Using mock auth in Header component');
  }
  
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      logger.error('Failed to log out', error);
    }
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (!currentUser || !currentUser.username) return '?';
    return currentUser.username.charAt(0).toUpperCase();
  };

  // Navigate to profile page
  const goToProfile = () => {
    navigate('/profile');
  };

  return (
    <header className="app-header">
      <div className="app-header-container">
        <div className="app-logo">
          <Link to="/">
            <img 
              src="/Harmoni Logo Icon Only-01.png"
              alt="Harmoni Logo"
              className="app-logo-icon"
            />
            <span>Harmoni</span>
          </Link>
        </div>

        <div className="app-header-actions">
          {currentUser ? (
            <div 
              className="app-user-avatar" 
              onClick={goToProfile}
              role="button"
              aria-label="Go to profile"
              tabIndex={0}
            >
              {getUserInitial()}
            </div>
          ) : (
            <div className="app-auth-buttons">
              <Link to="/login" className="app-login-button">Login</Link>
              <Link to="/register" className="app-register-button">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Export a version with error boundary
export const Header = withAuthAndErrorBoundary(HeaderComponent); 