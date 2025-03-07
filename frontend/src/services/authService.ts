import { authService as apiAuthService, forceRealAuthentication } from './api';
import { getDeviceType, logMobileDeviceInfo } from '../utils/mobileDetection';
import logger from '../utils/logger';

// Define user type
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  userType?: 'parent' | 'child';
  yearGroup?: number;
}

// Define response types
interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  user: User;
}

// Define auth state
export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Create a class to manage authentication
class AuthManager {
  private state: AuthState = {
    currentUser: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    logger.info('AuthManager: Initializing');
    this.initialize();
  }

  // Initialize auth state from localStorage
  private async initialize() {
    try {
      logger.info('AuthManager: Checking for existing session');
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      // Log device info for debugging
      const deviceType = getDeviceType();
      if (deviceType === 'mobile') {
        logger.info('AuthManager: Initializing on mobile device');
        logMobileDeviceInfo();
      }

      if (token && userStr) {
        try {
          logger.info('AuthManager: Found token and user data');
          const user = JSON.parse(userStr);
          
          // Additional handling for student accounts on mobile
          if (user.role === 'student' && deviceType === 'mobile') {
            logger.info('AuthManager: Student account on mobile device detected');
            // Extend token expiration for students on mobile to reduce reauth frequency
            const tokenExpiry = localStorage.getItem('tokenExpiry');
            if (tokenExpiry && new Date(tokenExpiry) < new Date(Date.now() + 60 * 60 * 1000)) {
              // If token expires in less than an hour, try to refresh it silently
              logger.info('AuthManager: Student mobile session needs refreshing');
              try {
                await this.refreshSession(user);
              } catch (refreshError) {
                logger.warn('Silent token refresh failed, continuing with current token', refreshError);
              }
            }
          }
          
          // Update state with user data
          this.updateState({
            currentUser: user,
            isAuthenticated: true,
            isLoading: false
          });
          
          logger.info('AuthManager: Successfully restored user session');
        } catch (error) {
          logger.error('AuthManager: Failed to parse user data', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.updateState({ isLoading: false });
        }
      } else {
        logger.info('AuthManager: No existing session found');
        this.updateState({ isLoading: false });
      }
    } catch (error) {
      logger.error('AuthManager: Initialization error', error);
      this.updateState({ 
        isLoading: false,
        error: 'Failed to initialize authentication'
      });
    }
  }

  // Update state and notify listeners
  private updateState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  // Notify all listeners of state change
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Subscribe to state changes
  public subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Get current state
  public getState(): AuthState {
    return this.state;
  }

  // Login user
  public async login(email: string, password: string): Promise<void> {
    try {
      this.updateState({ isLoading: true, error: null });
      logger.info('AuthManager: Attempting login for', email);
      
      // Update API URL for mobile devices
      this.handleIpAddressForMobile();
      
      // Force real authentication mode before login
      forceRealAuthentication();
      logger.info('AuthManager: Forced real authentication mode - disabled mock data');
      
      const response = await apiAuthService.login(email, password);
      
      // Check if response has the expected structure
      if (!response || !response.data) {
        throw new Error('Invalid response format from authentication service');
      }
      
      // Check if we're getting mock data despite our settings
      if ('isMock' in response && response.isMock === true) {
        logger.warn('AuthManager: Received mock data response despite real auth settings');
        throw new Error('Mock authentication disabled. Please ensure server is running.');
      }
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response: missing token or user data');
      }
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Ensure mobile devices use the correct IP address
      this.handleIpAddressForMobile(token);
      
      // Update state
      this.updateState({
        currentUser: user,
        isAuthenticated: true,
        isLoading: false
      });
      
      logger.info('AuthManager: Login successful with real authentication');
    } catch (error: any) {
      logger.error('AuthManager: Login failed', error);
      
      // Enhanced error handling to distinguish different types of errors
      let enhancedError: any;
      
      if (error.code === 'ECONNABORTED' || !error.response || error.message.includes('Network Error')) {
        // Network connectivity issue
        enhancedError = {
          ...error,
          isNetworkError: true,
          userMessage: 'Cannot connect to the server. Please check your network connection and ensure the backend server is running.'
        };
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        // Authentication error - invalid credentials
        enhancedError = {
          ...error,
          isAuthError: true,
          userMessage: 'Invalid email or password. Please check your credentials and try again.'
        };
      } else if (error.response?.status === 429) {
        // Rate limiting
        enhancedError = {
          ...error,
          isRateLimitError: true,
          userMessage: 'Too many login attempts. Please try again later.'
        };
      } else {
        // Other API errors
        enhancedError = {
          ...error,
          userMessage: error.response?.data?.message || 'Login failed due to a server error. Please try again later.'
        };
      }
      
      this.updateState({ 
        isLoading: false,
        error: enhancedError.userMessage
      });
      
      throw enhancedError;
    }
  }

  // Register user
  public async register(userData: any): Promise<void> {
    try {
      this.updateState({ isLoading: true, error: null });
      logger.info('AuthManager: Attempting registration for', userData.email);
      
      const response = await apiAuthService.register(userData);
      const typedResponse = response as unknown as { data: RegisterResponse };
      const { token, user } = typedResponse.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      this.updateState({
        currentUser: user,
        isAuthenticated: true,
        isLoading: false
      });
      
      logger.info('AuthManager: Registration successful');
    } catch (error: any) {
      logger.error('AuthManager: Registration failed', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      this.updateState({ 
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  }

  // Logout user
  public logout(): void {
    logger.info('AuthManager: Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    this.updateState({
      currentUser: null,
      isAuthenticated: false
    });
    
    logger.info('AuthManager: Logout successful');
  }

  // Update user data
  public updateUser(userData: Partial<User>): void {
    if (!this.state.currentUser) {
      logger.warn('AuthManager: Cannot update user - no user logged in');
      return;
    }
    
    const updatedUser = { ...this.state.currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    this.updateState({
      currentUser: updatedUser
    });
    
    logger.info('AuthManager: User data updated');
  }

  // Update user type (parent or child)
  public async updateUserType(userType: 'parent' | 'child'): Promise<void> {
    if (!this.state.currentUser) {
      logger.warn('AuthManager: Cannot update user type - no user logged in');
      throw new Error('No user logged in');
    }
    
    this.updateState({ isLoading: true, error: null });
    
    try {
      const response = await apiAuthService.updateUserType(this.state.currentUser.id, userType);
      
      if (!response || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      // Update the user in state and localStorage
      const updatedUser = { ...this.state.currentUser, userType };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      this.updateState({
        currentUser: updatedUser,
        isLoading: false
      });
      
      logger.info('AuthManager: User type updated to', userType);
    } catch (error: any) {
      logger.error('AuthManager: Failed to update user type', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user type. Please try again.';
      this.updateState({ 
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  }

  // Update year group
  public async updateYearGroup(yearGroup: number): Promise<void> {
    if (!this.state.currentUser) {
      logger.warn('AuthManager: Cannot update year group - no user logged in');
      throw new Error('No user logged in');
    }
    
    this.updateState({ isLoading: true, error: null });
    
    try {
      const response = await apiAuthService.updateYearGroup(this.state.currentUser.id, yearGroup);
      
      if (!response || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      // Update the user in state and localStorage
      const updatedUser = { ...this.state.currentUser, yearGroup };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      this.updateState({
        currentUser: updatedUser,
        isLoading: false
      });
      
      logger.info('AuthManager: Year group updated to', yearGroup);
    } catch (error: any) {
      logger.error('AuthManager: Failed to update year group', error);
      const errorMessage = error.response?.data?.message || 'Failed to update year group. Please try again.';
      this.updateState({ 
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  }

  // Add a helper method to refresh session
  private async refreshSession(user: User): Promise<void> {
    try {
      // Call a minimal API endpoint to refresh the token
      const response = await apiAuthService.refreshToken();
      if (response.token) {
        // Update token in localStorage
        localStorage.setItem('token', response.token);
        // Set expiry to 24 hours from now
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        localStorage.setItem('tokenExpiry', expiry);
        logger.info('AuthManager: Successfully refreshed token');
      }
    } catch (error) {
      logger.error('AuthManager: Failed to refresh token', error);
      throw error;
    }
  }

  // Helper function to handle IP address for mobile devices
  private handleIpAddressForMobile(token: string | null = null): void {
    const isMobileDevice = getDeviceType() === 'mobile';
    
    if (isMobileDevice) {
      logger.info('Mobile device detected in AuthManager, ensuring correct IP address is used');
      
      // Update API base URL in localStorage for mobile devices
      localStorage.setItem('api_base_url', 'http://192.168.1.67:3000/api');
      
      // If token exists, ensure it's properly stored
      if (token) {
        localStorage.setItem('token', token);
      }
    }
  }

  // Get the current token
  public getToken(): string | null {
    return localStorage.getItem('token');
  }
}

// Create a singleton instance
export const authManager = new AuthManager();

// Export a hook for React components
export function useAuthManager() {
  return authManager;
}

export default authManager; 