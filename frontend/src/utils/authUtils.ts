import logger from '../utils/logger';

/**
 * Auth Utilities
 * 
 * This file contains utility functions for auth-related operations
 * and debugging tools for troubleshooting authentication issues.
 */

/**
 * Checks if the user is authenticated by looking directly at localStorage
 */
export const isAuthenticatedFromStorage = (): boolean => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    return !!(token && userStr);
  } catch (error) {
    logger.error('Error checking authentication from localStorage:', error);
    return false;
  }
};

/**
 * Get current user data from localStorage
 */
export const getCurrentUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    logger.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

/**
 * Fix common authentication issues by ensuring localStorage is consistent
 */
export const fixAuthenticationIssues = (): boolean => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // If we have a token but no user data, clear token
    if (token && !userStr) {
      logger.info('AuthUtils: Found token but no user data, clearing token');
      localStorage.removeItem('token');
      return true;
    }
    
    // If we have user data but no token, clear user data
    if (!token && userStr) {
      logger.info('AuthUtils: Found user data but no token, clearing user data');
      localStorage.removeItem('user');
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Error fixing authentication issues:', error);
    return false;
  }
};

/**
 * Debug authentication state
 */
export const debugAuth = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    console.group('Auth Debug Information');
    logger.info('Has token:', !!token);
    logger.info('Has user data:', !!user);
    if (user) {
      logger.info('User email:', user.email);
      logger.info('User role:', user.role);
      logger.info('User ID:', user.id);
    }
    logger.info('Token (first 20 chars):', token ? `${token.substring(0, 20)}...` : 'none');
    console.groupEnd();
    
    return {
      hasToken: !!token,
      hasUserData: !!user,
      user: user ? { email: user.email, role: user.role, id: user.id } : null,
      isAuthenticated: !!(token && user)
    };
  } catch (error) {
    logger.error('Error debugging auth state:', error);
    return { hasToken: false, hasUserData: false, user: null, isAuthenticated: false };
  }
};

export default {
  isAuthenticatedFromStorage,
  fixAuthenticationIssues,
  getCurrentUserFromStorage,
  debugAuth
}; 