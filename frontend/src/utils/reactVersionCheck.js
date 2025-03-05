import logger from '../utils/logger';

/**
 * Utility to check for duplicate React installations
 * Run this in the browser console to detect multiple React instances
 */

export function checkReactDuplicates() {
  const reactInstances = [];
  const reactDomInstances = [];

  // Check for React in window
  if (window.React) {
    reactInstances.push({
      source: 'window.React',
      version: window.React.version
    });
  }

  // Check for ReactDOM in window
  if (window.ReactDOM) {
    reactDomInstances.push({
      source: 'window.ReactDOM',
      version: window.ReactDOM.version
    });
  }

  // Try to get React from require if available
  try {
    const reactFromRequire = require('react');
    if (reactFromRequire) {
      reactInstances.push({
        source: 'require("react")',
        version: reactFromRequire.version
      });
    }
  } catch (e) {
    logger.info('Could not require React');
  }

  // Try to get ReactDOM from require if available
  try {
    const reactDomFromRequire = require('react-dom');
    if (reactDomFromRequire) {
      reactDomInstances.push({
        source: 'require("react-dom")',
        version: reactDomFromRequire.version
      });
    }
  } catch (e) {
    logger.info('Could not require ReactDOM');
  }

  // Log results
  logger.info('=== React Instances ===');
  console.table(reactInstances);
  
  logger.info('=== ReactDOM Instances ===');
  console.table(reactDomInstances);

  // Check for version mismatches
  const reactVersions = new Set(reactInstances.map(instance => instance.version));
  const reactDomVersions = new Set(reactDomInstances.map(instance => instance.version));

  if (reactVersions.size > 1) {
    logger.error('⚠️ MULTIPLE REACT VERSIONS DETECTED! This can cause hook errors.');
    logger.info('React versions found:', Array.from(reactVersions).join(', '));
  }

  if (reactDomVersions.size > 1) {
    logger.error('⚠️ MULTIPLE REACT-DOM VERSIONS DETECTED! This can cause hook errors.');
    logger.info('ReactDOM versions found:', Array.from(reactDomVersions).join(', '));
  }

  return {
    reactInstances,
    reactDomInstances,
    hasDuplicateReact: reactVersions.size > 1,
    hasDuplicateReactDom: reactDomVersions.size > 1
  };
}

// Add a global helper for easy console access
if (typeof window !== 'undefined') {
  window.checkReactDuplicates = checkReactDuplicates;
} 