import api from './api';
import { User } from './authService';
import { getDeviceType } from '../utils/mobileDetection';
import logger from '../utils/logger';

// Mock user data for fallback
const mockUserProfile = (): User => ({
  id: 'mock-user-id',
  username: 'mockuser',
  email: 'mockuser@example.com',
  role: 'student'
});

class UserService {
  async getProfile(): Promise<User> {
    try {
      logger.info('Attempting to fetch real user profile');
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch user profile:', error);
      
      const isMobileDevice = getDeviceType() === 'mobile';
      
      // For mobile devices, make additional attempts to get real data
      if (isMobileDevice) {
        logger.info('Mobile device detected - making additional attempts for real user profile data');
        try {
          // Try again with increased timeout
          const response = await api.get('/users/profile', { 
            timeout: 15000,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          logger.info('Successfully retrieved real profile data on mobile retry');
          return response.data;
        } catch (retryError) {
          logger.info('Additional attempt for real user profile failed on mobile', retryError);
        }
      }
      
      // Return mock data for authentication errors only as a last resort
      if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
        logger.info('Using mock user profile due to API error');
        return mockUserProfile();
      }
      throw error;
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to update user profile:', error);
      
      const isMobileDevice = getDeviceType() === 'mobile';
      
      // For mobile devices, make additional attempts
      if (isMobileDevice) {
        logger.info('Mobile device detected - making additional attempt to update profile');
        try {
          // Try again with increased timeout
          const response = await api.put('/users/profile', userData, {
            timeout: 15000,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          return response.data;
        } catch (retryError) {
          logger.info('Additional attempt to update profile failed on mobile', retryError);
        }
      }
      
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    try {
      const response = await api.post('/users/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to change password:', error);
      throw error;
    }
  }

  async deleteAccount(): Promise<any> {
    try {
      const response = await api.delete('/users/account');
      return response.data;
    } catch (error) {
      logger.error('Failed to delete account:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService; 