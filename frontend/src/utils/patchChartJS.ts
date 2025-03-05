/**
 * This file contains patches for Chart.js to ensure it uses the correct React instance
 */
import { getGlobalReact } from './reactUtils';
import logger from '../utils/logger';

/**
 * Patches Chart.js to use the global React instance
 * This should be called before any Chart.js components are rendered
 */
export const patchChartJS = (): void => {
  if (typeof window === 'undefined') return;

  // Get the global React instance
  const React = getGlobalReact();
  if (!React) {
    logger.warn('Global React instance not available for patching Chart.js');
    return;
  }

  // Only apply the patch if require is not defined or is a simple function
  if (!window.require) {
    // Define a simple require function that returns React for 'react' imports
    (window as any).require = function(moduleName: string) {
      if (moduleName === 'react') {
        return React;
      }
      if (moduleName === 'react-dom') {
        return window.ReactDOM;
      }
      
      throw new Error(`Cannot find module '${moduleName}'`);
    };
    logger.info('Simple require function added to window for Chart.js');
  } else {
    // If require already exists, we'll use a different approach
    logger.info('require already exists, using alternative approach');
    
    // Ensure React is available on window
    window.React = React;
    
    // Ensure ReactDOM is available on window
    if (!window.ReactDOM) {
      try {
        const ReactDOM = require('react-dom');
        window.ReactDOM = ReactDOM;
      } catch (error) {
        logger.error('Error setting ReactDOM on window:', error);
      }
    }
  }

  logger.info('Chart.js patched to use global React instance');
};

/**
 * Applies all necessary patches for Chart.js
 */
export const applyChartJSPatches = (): void => {
  try {
    patchChartJS();
    logger.info('All Chart.js patches applied successfully');
  } catch (error) {
    logger.error('Error applying Chart.js patches:', error);
  }
};

// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).patchChartJS = patchChartJS;
  (window as any).applyChartJSPatches = applyChartJSPatches;
}

export default {
  patchChartJS,
  applyChartJSPatches
}; 