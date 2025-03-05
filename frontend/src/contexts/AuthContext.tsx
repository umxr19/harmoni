import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/api';
import logger from '../utils/logger';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  userType?: 'parent' | 'child';
  yearGroup?: number;
}

// Define the response types for better type safety
interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  updateUserType: (userType: 'parent' | 'child') => Promise<void>;
  updateYearGroup: (yearGroup: number) => Promise<void>;
}

// Create a default context value to avoid undefined errors
const defaultContextValue: AuthContextType = {
  currentUser: null,
  isLoading: true,
  isAuthenticated: false,
  user: null,
  login: async () => { throw new Error('Auth context not initialized'); },
  register: async () => { throw new Error('Auth context not initialized'); },
  logout: () => { logger.error('Auth context not initialized'); },
  updateUser: () => { logger.error('Auth context not initialized'); },
  loading: false,
  error: null,
  isInitialized: false,
  updateUserType: async () => { throw new Error('Auth context not initialized'); },
  updateYearGroup: async () => { throw new Error('Auth context not initialized'); }
};

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for auth context
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use a ref to track if initialization has been completed
  const initializationCompleted = useRef(false);

  // Define the login function early to avoid the default implementation
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Attempting login for:', email);
      const response = await authService.login(email, password);
      logger.info('Login response received:', response);
      
      const { token, user } = response;
      
      if (!token || !user || !user.role) {
        throw new Error('Invalid response from server: missing token, user data, or role');
      }
      
      // Validate user role
      if (!['student', 'teacher', 'parent', 'admin'].includes(user.role)) {
        throw new Error(`Invalid user role: ${user.role}`);
      }
      
      logger.info('Storing authentication data in localStorage for role:', user.role);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update API configuration immediately after setting the token
      // This ensures the next request will have the proper headers
      await authService.validateToken(token);
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      setUser(user);
      logger.info('Login successful, user authenticated:', user.username, 'with role:', user.role);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to login. Please check your credentials.';
      setError(errorMessage);
      logger.error('Login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Attempting registration for:', userData.email, 'with role:', userData.role);
      
      // Ensure role is set to student if not specified
      if (!userData.role) {
        userData.role = 'student';
      }
      
      // Validate role
      if (!['student', 'teacher', 'parent', 'admin'].includes(userData.role)) {
        throw new Error(`Invalid user role: ${userData.role}`);
      }
      
      const response = await authService.register(userData);
      logger.info('Registration response received');
      
      const { token, user } = response;
      
      if (!token || !user || !user.role) {
        throw new Error('Invalid response from server: missing token, user data, or role');
      }
      
      // Store token and user data
      logger.info('Storing authentication data for new user with role:', user.role);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update API configuration immediately after setting the token
      await authService.validateToken(token);
      
      // Update current user
      setCurrentUser(user);
      setIsAuthenticated(true);
      setUser(user);
      
      logger.info('Registration successful:', user.username, 'with role:', user.role);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to register. Please try again.';
      setError(errorMessage);
      logger.error('Registration error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logger.info('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUser(null);
    logger.info('User logged out successfully');
  };

  const updateUser = (userData: Partial<User>) => {
    if (currentUser) {
      logger.info('Updating user data');
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      logger.info('User data updated successfully');
    } else {
      logger.warn('Attempted to update user data but no user is logged in');
    }
  };

  // New functions for updating user type and year group
  const updateUserType = async (userType: 'parent' | 'child') => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.updateUserType(currentUser.id, userType);
      
      if (!response || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      // Update local user data
      const updatedUser = { ...currentUser, userType };
      setCurrentUser(updatedUser);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      logger.info('User type updated successfully to:', userType);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update user type. Please try again.';
      setError(errorMessage);
      logger.error('User type update error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const updateYearGroup = async (yearGroup: number) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.updateYearGroup(currentUser.id, yearGroup);
      
      if (!response || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      // Update local user data
      const updatedUser = { ...currentUser, yearGroup };
      setCurrentUser(updatedUser);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      logger.info('Year group updated successfully to:', yearGroup);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update year group. Please try again.';
      setError(errorMessage);
      logger.error('Year group update error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    // Skip if we've already initialized
    if (initializationCompleted.current) {
      logger.info('Auth context already initialized, skipping');
      return;
    }
    
    const initializeAuth = async () => {
      logger.info('AuthProvider initializing, checking for existing session');
      
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            logger.info('Found token and user data in localStorage');
            const user = JSON.parse(userStr);
            
            // Validate token with a lightweight API call if possible
            try {
              // Optional: Make a lightweight API call to validate token
              // const response = await authService.validateToken(token);
              // if (response.data.valid) {
                setCurrentUser(user);
                setIsAuthenticated(true);
                setUser(user);
                logger.info('Successfully restored user session from localStorage');
              // } else {
              //   throw new Error('Token invalid');
              // }
            } catch (tokenError) {
              logger.error('Token validation failed', tokenError);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          } catch (parseError) {
            logger.error('Failed to parse user from localStorage', parseError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else {
          logger.info('No existing session found in localStorage');
        }
      } catch (error) {
        logger.error('Auth initialization error:', error);
      } finally {
        // Important: Set isLoading to false and isInitialized to true
        // to signal that the context is ready to be used
        setIsLoading(false);
        setIsInitialized(true);
        initializationCompleted.current = true;
        logger.info('Auth context initialization complete, ready to use');
      }
    };

    // Start initialization immediately
    initializeAuth();
  }, []);

  // Create the context value with all the auth methods and state
  const value = {
    currentUser,
    isLoading,
    isAuthenticated,
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    error,
    isInitialized,
    updateUserType,
    updateYearGroup
  };

  logger.info('AuthProvider rendering with auth state:', { 
    isAuthenticated, 
    hasUser: !!currentUser,
    isLoading,
    isInitialized
  });

  // Only render children when initialization is complete
  if (!isInitialized) {
    logger.info('AuthProvider still initializing, rendering loading state');
    // Return a context provider with the current value, but without children
    return (
      <AuthContext.Provider value={value}>
        {/* Optionally render a loading indicator here */}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 