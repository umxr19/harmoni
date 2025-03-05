import React, { createContext, useState, useEffect } from 'react';
import logger from '../utils/logger';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  yearGroup?: string;
  userType?: string;
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
}

// Create a default mock context value
const defaultMockContextValue: AuthContextType = {
  currentUser: null,
  isLoading: false,
  isAuthenticated: false,
  user: null,
  login: async (email: string, password: string) => {
    logger.info('Default mock login called with:', email);
    
    // Create a mock user based on the email
    const mockUser = {
      id: '1',
      username: email.split('@')[0],
      email: email,
      role: 'student' as const,
      yearGroup: '',
      userType: 'student'
    };
    
    // Store in localStorage to simulate real auth - use the same keys as real auth
    localStorage.setItem('token', 'mock-token-value');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Reload the page to simulate login
    window.location.href = '/dashboard';
  },
  register: async (userData: any) => {
    logger.info('Default mock register called with:', userData);
    
    // Create a mock user based on the registration data
    const mockUser = {
      id: '1',
      username: userData.username || userData.email.split('@')[0],
      email: userData.email,
      role: userData.role || 'student' as const,
      yearGroup: userData.yearGroup || '',
      userType: userData.userType || 'student'
    };
    
    // Store in localStorage to simulate real auth - use the same keys as real auth
    localStorage.setItem('token', 'mock-token-value');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Reload the page to simulate registration
    window.location.href = '/dashboard';
  },
  logout: () => {
    logger.info('Default mock logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
  updateUser: (userData: Partial<User>) => {
    logger.info('Default mock updateUser called with:', userData);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const currentUser = JSON.parse(userStr);
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        logger.error('Failed to update mock user:', error);
      }
    }
  },
  loading: false,
  error: null,
  isInitialized: true
};

// Create the context with the default mock implementation
export const MockAuthContext = createContext<AuthContextType>(defaultMockContextValue);

// Create a mock auth context with default values and functional implementations
export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(true);

  // Check for existing mock session on mount
  useEffect(() => {
    logger.info('MockAuthProvider initializing, checking for existing session');
    // Use the same localStorage keys as the real auth context
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        logger.info('Found token and user data in localStorage');
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setIsAuthenticated(true);
        logger.info('Successfully restored mock user session from localStorage');
      } catch (error) {
        logger.error('Failed to parse mock user from localStorage', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      logger.info('No existing mock session found in localStorage');
    }
  }, []);

  const login = async (email: string, password: string) => {
    logger.info('Mock login called with:', email);
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a mock user based on the email
      const mockUser = {
        id: '1',
        username: email.split('@')[0],
        email: email,
        role: 'student' as const,
        yearGroup: '',
        userType: 'student'
      };
      
      // Store in localStorage to simulate real auth - use the same keys as real auth
      localStorage.setItem('token', 'mock-token-value');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Update state
      setCurrentUser(mockUser);
      setIsAuthenticated(true);
      
      logger.info('Mock login successful for:', email);
    } catch (error) {
      logger.error('Mock login error:', error);
      setError('Failed to login with mock authentication');
      throw new Error('Mock login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    logger.info('Mock register called with:', userData);
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a mock user based on the registration data
      const mockUser = {
        id: '1',
        username: userData.username || userData.email.split('@')[0],
        email: userData.email,
        role: userData.role || 'student' as const,
        yearGroup: userData.yearGroup || '',
        userType: userData.userType || 'student'
      };
      
      // Store in localStorage to simulate real auth - use the same keys as real auth
      localStorage.setItem('token', 'mock-token-value');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Update state
      setCurrentUser(mockUser);
      setIsAuthenticated(true);
      
      logger.info('Mock registration successful for:', userData.email);
    } catch (error) {
      logger.error('Mock registration error:', error);
      setError('Failed to register with mock authentication');
      throw new Error('Mock registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logger.info('Mock logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    logger.info('Mock logout successful');
  };

  const updateUser = (userData: Partial<User>) => {
    logger.info('Mock updateUser called with:', userData);
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      logger.info('Mock user updated successfully');
    } else {
      logger.warn('Attempted to update mock user data but no user is logged in');
    }
  };

  const mockAuthContextValue: AuthContextType = {
    currentUser,
    isLoading,
    isAuthenticated,
    user: currentUser,
    login,
    register,
    logout,
    updateUser,
    loading,
    error,
    isInitialized
  };

  logger.info('MockAuthProvider rendering with auth state:', { 
    isAuthenticated, 
    hasUser: !!currentUser,
    isLoading,
    isInitialized
  });

  return (
    <MockAuthContext.Provider value={mockAuthContextValue}>
      {children}
    </MockAuthContext.Provider>
  );
};

export default MockAuthProvider; 