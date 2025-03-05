/**
 * Utility functions for Chart.js integration
 */
import { getGlobalReact } from './reactUtils';
import logger from '../utils/logger';

/**
 * Ensures Chart.js has the correct React instance
 * This should be called before rendering any Chart.js components
 */
export const ensureChartJSReact = (): void => {
  if (typeof window === 'undefined') return;

  const React = getGlobalReact();
  if (!React) {
    logger.warn('Global React instance not available for Chart.js');
    return;
  }

  // Set React on window
  window.React = React;

  // Set ReactDOM on window
  if (!window.ReactDOM) {
    try {
      // Try to get ReactDOM from require
      const ReactDOM = require('react-dom');
      window.ReactDOM = ReactDOM;
    } catch (error) {
      logger.error('Error setting ReactDOM on window for Chart.js:', error);
    }
  }

  logger.info('Chart.js React environment prepared');
};

/**
 * Creates a safe Chart.js environment
 * This patches the Chart.js environment to prevent "Invalid hook call" errors
 */
export const createSafeChartEnvironment = (): void => {
  ensureChartJSReact();

  // Add additional patches if needed in the future
  
  // Add to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).ensureChartJSReact = ensureChartJSReact;
  }
};

export default {
  ensureChartJSReact,
  createSafeChartEnvironment
};

export const validateChartData = (data: any) => {
  if (!data) return false;
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return false;
  
  // Check for required properties based on data type
  return true;
};

// Format dates consistently
export const formatChartDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (e) {
    logger.error('Error formatting date:', e);
    return dateString;
  }
};

// Ensure numeric values
export const ensureNumeric = (value: any, defaultValue = 0) => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}; 