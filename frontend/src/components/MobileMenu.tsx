import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/mobile.css';
import '../styles/MobileHeader.css';
import logger from '../utils/logger';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close menu when location changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname, isOpen, onClose]);

  // Handle body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debug logging
  useEffect(() => {
    logger.info('Mobile menu isOpen:', isOpen);
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      onClose();
    } catch (error) {
      logger.error('Failed to log out', error);
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div 
      className={`mobile-menu ${isOpen ? 'open' : ''}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
    >
      <div className="mobile-menu-header">
        <h2>Menu</h2>
        <button 
          className="mobile-menu-close" 
          onClick={handleCloseClick}
          aria-label="Close menu"
          type="button"
        >
          ✕
        </button>
      </div>
      
      <div className="mobile-menu-items">
        <div className="mobile-menu-item">
          <Link to="/" onClick={onClose}>
            Home
          </Link>
        </div>
        
        {currentUser ? (
          <>
            <div className="mobile-menu-item">
              <Link to="/dashboard" onClick={onClose}>
                Dashboard
              </Link>
            </div>
            <div className="mobile-menu-item">
              <Link to="/exams" onClick={onClose}>
                Exams
              </Link>
            </div>
            <div className="mobile-menu-item">
              <Link to="/practice" onClick={onClose}>
                Practice
              </Link>
            </div>
            <div className="mobile-menu-item">
              <Link to="/store" onClick={onClose}>
                Store
              </Link>
            </div>
            <div className="mobile-menu-item">
              <Link to="/profile" onClick={onClose}>
                Profile
              </Link>
            </div>
            <div className="mobile-menu-item">
              <Link to="/settings" onClick={onClose}>
                Settings
              </Link>
            </div>
            {currentUser.role === 'admin' && (
              <div className="mobile-menu-item">
                <Link to="/admin" onClick={onClose}>
                  Admin
                </Link>
              </div>
            )}
            <div className="mobile-menu-item">
              <button 
                onClick={handleLogout}
                className="mobile-menu-logout"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mobile-menu-item">
              <Link to="/login" onClick={onClose}>
                Login
              </Link>
            </div>
            <div className="mobile-menu-item">
              <Link to="/register" onClick={onClose}>
                Register
              </Link>
            </div>
          </>
        )}
      </div>
      
      {currentUser && (
        <div className="mobile-menu-footer">
          <div className="mobile-menu-user">
            <div className="mobile-menu-user-avatar">
              {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="mobile-menu-user-info">
              <div className="mobile-menu-user-name">{currentUser.username}</div>
              <div className="mobile-menu-user-email">{currentUser.email}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu; 