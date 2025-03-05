import logger from '../utils/logger';

/**
 * Utility to check for duplicate React installations
 * This can help diagnose "Invalid hook call" errors
 */

/**
 * Check for duplicate React installations in the application
 * @returns An object with information about React installations
 */
export const checkReactDuplicates = (): { 
  hasDuplicates: boolean; 
  details: string;
  reactInstances: any[];
} => {
  const reactInstances: any[] = [];
  const details: string[] = [];
  
  // Check for React in window
  if (typeof window !== 'undefined' && window.React) {
    reactInstances.push(window.React);
    details.push(`Window React: ${window.React.version}`);
  }
  
  // Check for React from import
  try {
    const importedReact = require('react');
    if (reactInstances.length === 0 || reactInstances[0] !== importedReact) {
      reactInstances.push(importedReact);
      details.push(`Imported React: ${importedReact.version}`);
    }
  } catch (error) {
    details.push('Could not require React');
  }
  
  // Check for React DOM in window
  if (typeof window !== 'undefined' && window.ReactDOM) {
    details.push(`Window ReactDOM: ${window.ReactDOM.version}`);
  }
  
  // Check for React DOM from import
  try {
    const importedReactDOM = require('react-dom');
    details.push(`Imported ReactDOM: ${importedReactDOM.version}`);
  } catch (error) {
    details.push('Could not require ReactDOM');
  }
  
  // Check for duplicate React instances
  const hasDuplicates = reactInstances.length > 1;
  
  if (hasDuplicates) {
    details.push('WARNING: Multiple React instances detected!');
    details.push('This can cause "Invalid hook call" errors.');
  } else if (reactInstances.length === 0) {
    details.push('WARNING: No React instances found!');
  } else {
    details.push('OK: Single React instance detected.');
  }
  
  return {
    hasDuplicates,
    details: details.join('\n'),
    reactInstances
  };
};

/**
 * Fix common issues with React and Chart.js
 */
export const fixChartJSReactIssues = (): void => {
  if (typeof window !== 'undefined') {
    try {
      // Ensure React is available on window
      if (!window.React) {
        const React = require('react');
        window.React = React;
        logger.info('Added React to window object for Chart.js');
      }
      
      // Ensure ReactDOM is available on window
      if (!window.ReactDOM) {
        const ReactDOM = require('react-dom');
        window.ReactDOM = ReactDOM;
        logger.info('Added ReactDOM to window object for Chart.js');
      }
    } catch (error) {
      logger.error('Error fixing Chart.js React issues:', error);
    }
  }
};

// Add the utility to the window for easy access in the console
if (typeof window !== 'undefined') {
  (window as any).checkReactDuplicates = checkReactDuplicates;
  (window as any).fixChartJSReactIssues = fixChartJSReactIssues;
}

export default checkReactDuplicates; 