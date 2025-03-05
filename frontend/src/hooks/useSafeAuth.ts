import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { MockAuthContext } from '../contexts/mockAuthContext';
import { isAuthenticatedFromStorage, fixAuthenticationIssues, getCurrentUserFromStorage } from '../utils/authUtils';
import logger from '../utils/logger';

/**
 * A hook that safely uses auth context, falling back to mock auth when needed
 * This provides a safety net in case the auth context is not available
 */
export const useSafeAuth = () => {
  // Get both contexts
  const authContext = useContext(AuthContext);
  const mockContext = useContext(MockAuthContext);
  
  // State to track which context to use
  const [usingMockAuth, setUsingMockAuth] = useState(false);
  // State to track if we've checked localStorage directly
  const [localStorageChecked, setLocalStorageChecked] = useState(false);
  // State to track if user is authenticated based on localStorage
  const [isAuthenticatedFromLocalStorage, setIsAuthenticatedFromLocalStorage] = useState(false);
  // State to track the user from localStorage
  const [userFromLocalStorage, setUserFromLocalStorage] = useState(null);
  
  // Check if the auth context is properly initialized
  const isAuthContextInitialized = () => {
    // The AuthProvider now guarantees that the context is initialized
    // before rendering children, so we just need to check if it exists
    return !!authContext && authContext.isInitialized === true;
  };
  
  // Check localStorage directly for authentication tokens
  useEffect(() => {
    if (!localStorageChecked) {
      // Fix any issues with authentication in localStorage
      fixAuthenticationIssues();
      
      // Check if user is authenticated from localStorage
      const isAuthenticated = isAuthenticatedFromStorage();
      setIsAuthenticatedFromLocalStorage(isAuthenticated);
      
      // Get user from localStorage if authenticated
      if (isAuthenticated) {
        setUserFromLocalStorage(getCurrentUserFromStorage());
      }
      
      setLocalStorageChecked(true);
    }
  }, [localStorageChecked]);
  
  // Use useEffect to log which context we're using
  useEffect(() => {
    const initialized = isAuthContextInitialized();
    
    // Log detailed information about the context state
    logger.info('Auth context state:', {
      isInitialized: authContext?.isInitialized,
      isLoading: authContext?.isLoading,
      hasLoginMethod: !!authContext?.login,
      isAuthenticated: authContext?.isAuthenticated,
      hasUser: !!authContext?.currentUser,
      usingMock: !initialized,
      isAuthenticatedFromLocalStorage,
      hasUserFromLocalStorage: !!userFromLocalStorage
    });
    
    if (initialized) {
      logger.info('Using real auth context');
      setUsingMockAuth(false);
    } else if (!authContext?.isInitialized && isAuthenticatedFromLocalStorage) {
      // If auth context is not initialized but we have tokens in localStorage,
      // we should still use the real auth context and wait for it to initialize
      logger.info('Auth context not yet initialized, but user is authenticated from localStorage');
      setUsingMockAuth(false);
    } else {
      logger.warn('Auth context not available, falling back to mock auth');
      setUsingMockAuth(true);
    }
  }, [authContext, mockContext, isAuthenticatedFromLocalStorage, userFromLocalStorage]);
  
  // Return the appropriate context
  if (!usingMockAuth && (isAuthContextInitialized() || isAuthenticatedFromLocalStorage)) {
    // If auth context is initialized or we have tokens in localStorage,
    // use the real auth context
    return { 
      ...authContext, 
      // Override isAuthenticated if we know the user is authenticated from localStorage
      isAuthenticated: authContext.isAuthenticated || isAuthenticatedFromLocalStorage,
      // Override currentUser if we have a user from localStorage and auth context doesn't
      currentUser: authContext.currentUser || userFromLocalStorage,
      isMockAuth: false,
      _contextInfo: {
        type: 'real',
        isInitialized: authContext.isInitialized,
        isAuthenticatedFromLocalStorage,
        hasUserFromLocalStorage: !!userFromLocalStorage
      }
    };
  }
  
  // Fallback to mock context
  return { 
    ...mockContext, 
    isMockAuth: true,
    _contextInfo: {
      type: 'mock',
      isInitialized: mockContext.isInitialized
    }
  };
}; 