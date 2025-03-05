import logger from '../utils/logger';

/**
 * Utility to help diagnose and fix React version issues
 * 
 * This file provides functions to:
 * 1. Check for duplicate React installations
 * 2. Ensure a consistent React context for hooks
 * 3. Fix common issues with Recharts and React
 */

// Store a reference to the React instance we want to use
let safeReact = null;
let safeReactDOM = null;

/**
 * Initialize the safe React references
 * Call this as early as possible in your application
 */
export function initializeSafeReact() {
  try {
    // Import React and ReactDOM
    const React = require('react');
    const ReactDOM = require('react-dom');
    
    // Store references
    safeReact = React;
    safeReactDOM = ReactDOM;
    
    // Log success
    logger.info('Safe React initialized:', React.version);
    
    return { React, ReactDOM };
  } catch (error) {
    logger.error('Failed to initialize safe React:', error);
    return null;
  }
}

/**
 * Get the safe React instance
 */
export function getSafeReact() {
  if (!safeReact) {
    logger.warn('Safe React not initialized. Call initializeSafeReact() first.');
  }
  return safeReact;
}

/**
 * Get the safe ReactDOM instance
 */
export function getSafeReactDOM() {
  if (!safeReactDOM) {
    logger.warn('Safe ReactDOM not initialized. Call initializeSafeReact() first.');
  }
  return safeReactDOM;
}

/**
 * Check for React version mismatches
 */
export function checkReactVersions() {
  try {
    // Try to get React from different sources
    const reactVersions = new Set();
    const reactDomVersions = new Set();
    
    // From window
    if (window.React) {
      reactVersions.add(window.React.version);
    }
    
    // From require
    try {
      const React = require('react');
      reactVersions.add(React.version);
    } catch (e) {
      logger.info('Could not require React');
    }
    
    // From window
    if (window.ReactDOM) {
      reactDomVersions.add(window.ReactDOM.version);
    }
    
    // From require
    try {
      const ReactDOM = require('react-dom');
      reactDomVersions.add(ReactDOM.version);
    } catch (e) {
      logger.info('Could not require ReactDOM');
    }
    
    // Check for mismatches
    const hasMismatchedReact = reactVersions.size > 1;
    const hasMismatchedReactDOM = reactDomVersions.size > 1;
    
    if (hasMismatchedReact) {
      logger.error('Multiple React versions detected:', Array.from(reactVersions).join(', '));
    }
    
    if (hasMismatchedReactDOM) {
      logger.error('Multiple ReactDOM versions detected:', Array.from(reactDomVersions).join(', '));
    }
    
    return {
      hasMismatchedReact,
      hasMismatchedReactDOM,
      reactVersions: Array.from(reactVersions),
      reactDomVersions: Array.from(reactDomVersions)
    };
  } catch (error) {
    logger.error('Error checking React versions:', error);
    return {
      hasMismatchedReact: false,
      hasMismatchedReactDOM: false,
      reactVersions: [],
      reactDomVersions: []
    };
  }
}

/**
 * Fix common issues with Recharts
 */
export function fixRechartsIssues() {
  // Ensure window.React is defined (Recharts sometimes expects this)
  if (!window.React && safeReact) {
    window.React = safeReact;
    logger.info('Added React to window object');
  }
  
  // Ensure window.ReactDOM is defined
  if (!window.ReactDOM && safeReactDOM) {
    window.ReactDOM = safeReactDOM;
    logger.info('Added ReactDOM to window object');
  }
}

// Add global helpers for easy console access
if (typeof window !== 'undefined') {
  window.checkReactVersions = checkReactVersions;
  window.fixRechartsIssues = fixRechartsIssues;
} 