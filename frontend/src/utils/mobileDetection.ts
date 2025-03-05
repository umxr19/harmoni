import React from 'react';
import logger from '../utils/logger';

/**
 * Mobile detection utility functions
 * These functions help detect mobile devices and provide information about the user's device
 */

/**
 * Check if the current device is a mobile device
 * @returns {boolean} True if the device is mobile, false otherwise
 */
export const isMobileDevice = (): boolean => {
  try {
    // Check if window is defined (for SSR safety)
    if (typeof window === 'undefined') return false;
    
    // Safely access user agent
    const userAgent = 
      (typeof navigator !== 'undefined' ? navigator.userAgent : '') || 
      (typeof window !== 'undefined' ? (window as any).navigator?.userAgent : '') || 
      '';
    
    // Regular expression for mobile devices
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    
    return mobileRegex.test(userAgent);
  } catch (error) {
    logger.error('Error in isMobileDevice:', error);
    return false; // Default to desktop on error
  }
};

/**
 * Check if the current device is a tablet
 * @returns {boolean} True if the device is a tablet, false otherwise
 */
export const isTabletDevice = (): boolean => {
  try {
    // Check if window is defined (for SSR safety)
    if (typeof window === 'undefined') return false;
    
    // Safely access user agent
    const userAgent = 
      (typeof navigator !== 'undefined' ? navigator.userAgent : '') || 
      (typeof window !== 'undefined' ? (window as any).navigator?.userAgent : '') || 
      '';
    
    // Regular expression for tablets
    const tabletRegex = /(iPad|tablet|Tablet|Android(?!.*Mobile))/i;
    
    return tabletRegex.test(userAgent);
  } catch (error) {
    logger.error('Error in isTabletDevice:', error);
    return false; // Default to non-tablet on error
  }
};

/**
 * Get the device type (mobile, tablet, desktop)
 * @returns {string} The device type
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  try {
    if (isMobileDevice() && !isTabletDevice()) {
      return 'mobile';
    } else if (isTabletDevice()) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  } catch (error) {
    logger.error('Error in getDeviceType:', error);
    return 'desktop'; // Default to desktop on error
  }
};

/**
 * Check if the device is in portrait orientation
 * @returns {boolean} True if the device is in portrait orientation, false otherwise
 */
export const isPortraitOrientation = (): boolean => {
  try {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(orientation: portrait)').matches;
  } catch (error) {
    logger.error('Error in isPortraitOrientation:', error);
    return false;
  }
};

/**
 * Get the screen width
 * @returns {number} The screen width in pixels
 */
export const getScreenWidth = (): number => {
  try {
    if (typeof window === 'undefined') return 1024; // Default value
    return window.innerWidth || 
           (document && document.documentElement ? document.documentElement.clientWidth : 0) || 
           (document && document.body ? document.body.clientWidth : 0) || 
           1024;
  } catch (error) {
    logger.error('Error in getScreenWidth:', error);
    return 1024; // Default to desktop width on error
  }
};

/**
 * Get the screen height
 * @returns {number} The screen height in pixels
 */
export const getScreenHeight = (): number => {
  try {
    if (typeof window === 'undefined') return 768; // Default value
    return window.innerHeight || 
           (document && document.documentElement ? document.documentElement.clientHeight : 0) || 
           (document && document.body ? document.body.clientHeight : 0) || 
           768;
  } catch (error) {
    logger.error('Error in getScreenHeight:', error);
    return 768; // Default to desktop height on error
  }
};

/**
 * Check if the device supports touch events
 * @returns {boolean} True if the device supports touch events, false otherwise
 */
export const isTouchDevice = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0) || false;
  } catch (error) {
    logger.error('Error in isTouchDevice:', error);
    return false;
  }
};

/**
 * Get the device pixel ratio
 * @returns {number} The device pixel ratio
 */
export const getDevicePixelRatio = (): number => {
  try {
    if (typeof window === 'undefined') return 1;
    return window.devicePixelRatio || 1;
  } catch (error) {
    logger.error('Error in getDevicePixelRatio:', error);
    return 1;
  }
};

/**
 * Hook to listen for window resize events and determine if the device is mobile
 * @param {number} breakpoint - The breakpoint for mobile devices (default: 768)
 * @returns {boolean} True if the screen width is less than or equal to the breakpoint
 */
export const useIsMobile = (breakpoint: number = 768): boolean => {
  // Initial state with safe computation
  const safelyGetInitialState = () => {
    try {
      return getScreenWidth() <= breakpoint;
    } catch (error) {
      logger.error('Error computing initial mobile state:', error);
      return false;
    }
  };

  const [isMobile, setIsMobile] = React.useState<boolean>(safelyGetInitialState());

  React.useEffect(() => {
    // Safe resize handler with error boundary
    const handleResize = () => {
      try {
        setIsMobile(getScreenWidth() <= breakpoint);
      } catch (error) {
        logger.error('Error updating mobile state:', error);
      }
    };

    // Safety check for window
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      
      // Run once to ensure correct initial state
      handleResize();
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
    
    // No cleanup needed if window is undefined
    return undefined;
  }, [breakpoint]);

  return isMobile;
};

/**
 * Optimizes service loading for mobile devices
 * Helps manage service loading for different device types and user roles
 */
export interface ServiceLoadingOptions {
  prioritized?: boolean;
  concurrentRequests?: number;
  retryAttempts?: number;
  timeout?: number;
}

const defaultOptions: ServiceLoadingOptions = {
  prioritized: false,
  concurrentRequests: 2,
  retryAttempts: 3,
  timeout: 30000
};

/**
 * Get optimized loading options based on device type and user role
 * @param role User role (student, teacher, etc.)
 * @returns Optimized service loading options
 */
export const getMobileServiceOptions = (role?: string): ServiceLoadingOptions => {
  // Early safety check - ensure we can access the window object
  if (typeof window === 'undefined') {
    return { ...defaultOptions };
  }

  try {
    const deviceType = getDeviceType();
    const isLowPerfDevice = deviceType === 'mobile' && getDevicePixelRatio() < 2;
    
    // Default options for most users
    const options: ServiceLoadingOptions = {
      ...defaultOptions
    };
    
    // For mobile devices
    if (deviceType === 'mobile') {
      options.concurrentRequests = 1; // Reduce concurrent requests
      options.prioritized = true; // Prioritize critical services
    }
    
    // For tablets
    if (deviceType === 'tablet') {
      options.concurrentRequests = 2;
    }
    
    // For student accounts on mobile (special case)
    if (role && role === 'student' && deviceType === 'mobile') {
      options.retryAttempts = 5; // More retry attempts
      options.timeout = 45000; // Longer timeout
    }
    
    return options;
  } catch (error) {
    // If anything fails, return default options - this prevents undefined errors
    logger.error('Error in getMobileServiceOptions:', error);
    return { ...defaultOptions };
  }
};

/**
 * Log mobile device information for debugging
 */
export const logMobileDeviceInfo = (): void => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      logger.info('Mobile device info: Not in browser environment');
      return;
    }
    
    logger.info('Device Type:', getDeviceType());
    logger.info('Screen Size:', getScreenWidth(), 'x', getScreenHeight());
    logger.info('Pixel Ratio:', getDevicePixelRatio());
    logger.info('Touch Supported:', isTouchDevice());
    logger.info('Portrait Mode:', isPortraitOrientation());
    
    // Safely access navigator
    if (typeof navigator !== 'undefined') {
      logger.info('User Agent:', navigator.userAgent || 'Unknown');
      logger.info('Platform:', navigator.platform || 'Unknown');
      logger.info('Browser Language:', navigator.language || 'Unknown');
      
      // Additional mobile-specific info
      if (getDeviceType() === 'mobile') {
        logger.info('Mobile Connection:', 
          (navigator as any).connection ? 
          JSON.stringify((navigator as any).connection) : 
          'Connection API not available'
        );
      }
    }
  } catch (error) {
    logger.error('Error logging mobile device info:', error);
  }
};

/**
 * Diagnostic function to check if student mobile optimizations are active
 * This can be called explicitly to debug mobile student account issues
 */
export const checkStudentMobileOptimizations = (role?: string): void => {
  try {
    logger.info('--- Student Mobile Optimization Diagnostic ---');
    
    // Check device type
    const deviceType = getDeviceType();
    logger.info('Device Type Detected:', deviceType);
    
    // Check user role
    logger.info('User Role:', role || 'undefined/missing');
    
    // Check if optimizations should be applied
    const shouldApplyOptimizations = 
      deviceType === 'mobile' && role === 'student';
    logger.info('Should Apply Student Mobile Optimizations:', shouldApplyOptimizations);
    
    // Log current options
    const options = getMobileServiceOptions(role);
    logger.info('Current Service Loading Options:', options);
    
    // Additional environment checks
    logger.info('Environment Variables Available:', {
      NODE_ENV: process.env.NODE_ENV || 'undefined',
      API_URL: process.env.VITE_API_URL || 'undefined'
    });
    
    // LocalStorage check
    if (typeof window !== 'undefined' && window.localStorage) {
      const hasToken = !!localStorage.getItem('token');
      const hasUser = !!localStorage.getItem('user');
      logger.info('Authentication State:', {
        hasToken,
        hasUser,
        tokenExpiry: localStorage.getItem('tokenExpiry') || 'not set'
      });
    }
    
    logger.info('-------------------------------------------');
  } catch (error) {
    logger.error('Error in student mobile optimization diagnostic:', error);
  }
};

// Initialization code to run on module load
(() => {
  try {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const isMobile = getDeviceType() === 'mobile';
      
      // Add a global diagnostic function for debugging in mobile browsers
      (window as any).__checkMobileOptimizations = checkStudentMobileOptimizations;
      
      if (isMobile) {
        logger.info('Mobile device detected. For diagnostics, call window.__checkMobileOptimizations(userRole) in console.');
      }
    }
  } catch (error) {
    logger.error('Error in mobile detection initialization:', error);
  }
})(); 