import { useState, useEffect } from 'react';
import { authManager, AuthState } from '../services/authService';
import logger from '../utils/logger';

/**
 * Hook to access authentication state and methods
 * This hook subscribes to the authManager and provides its state and methods to components
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(authManager.getState());

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authManager.subscribe(state => {
      setAuthState(state);
    });

    // Log auth state on mount
    logger.info('useAuth hook initialized with state:', authManager.getState());

    // Unsubscribe on unmount
    return () => unsubscribe();
  }, []);

  // Return auth state and methods
  return {
    ...authState,
    login: authManager.login.bind(authManager),
    register: authManager.register.bind(authManager),
    logout: authManager.logout.bind(authManager),
    updateUser: authManager.updateUser.bind(authManager),
    updateUserType: authManager.updateUserType.bind(authManager),
    updateYearGroup: authManager.updateYearGroup.bind(authManager),
    getToken: authManager.getToken.bind(authManager),
    // Add a flag to indicate this is the real auth (not mock)
    isMockAuth: false
  };
}

export default useAuth; 