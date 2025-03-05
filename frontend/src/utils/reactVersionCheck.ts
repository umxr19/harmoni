import logger from '../utils/logger';

/**
 * Utility to check for duplicate React instances at runtime
 */

// Extend Window interface to include React instances
declare global {
  interface Window {
  // @ts-ignore
  React: any;
  // @ts-ignore
  ReactDOM: any;
    __REACT_INSTANCES?: any[];
  }
}

export const checkReactDuplicates = (): void => {
  if (typeof window === 'undefined') return;

  // Store references to all React instances
  const reactInstances = new Set();
  
  // Check main React instance
  const mainReact = require('react');
  reactInstances.add(mainReact);
  
  // Check if react-dom is using the same React
  try {
    const reactDom = require('react-dom');
    if (reactDom.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentOwner) {
      const reactDomReact = reactDom.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
      reactInstances.add(reactDomReact);
    }
  } catch (e) {
    logger.error('Error checking react-dom:', e);
  }
  
  // Check if react-chartjs-2 is using the same React
  try {
    const chartjs2 = require('react-chartjs-2');
    if (chartjs2.Line?.$$typeof) {
      // This is a React component, but we can't directly access its React instance
      logger.info('react-chartjs-2 components detected');
    }
  } catch (e) {
    logger.error('Error checking react-chartjs-2:', e);
  }
  
  // Log results
  if (reactInstances.size > 1) {
    logger.error(`CRITICAL: Multiple React instances detected (${reactInstances.size})!`);
    logger.error('This will cause "Invalid hook call" errors with hooks.');
    logger.error('Check your package.json and node_modules for duplicate React installations.');
  } else {
    logger.info('React check: Single React instance detected ✓');
  }
  
  // Store React on window for debugging
  window.__REACT_INSTANCES = Array.from(reactInstances);
}; 