/**
 * Utility functions to help with React-related issues
 */

import React from 'react';
import ReactDOM from 'react-dom';

// Store a reference to the global React instance
const globalReact = React;

// Initialize React globally immediately
if (typeof window !== 'undefined') {
  window.React = React;
  window.ReactDOM = ReactDOM;
}

/**
 * Get the global React instance
 * @returns The global React instance
 */
export const getGlobalReact = (): typeof React => {
  return globalReact;
};

/**
 * Check if the React instance matches the global instance
 * @param reactInstance The React instance to check
 * @returns True if the instance matches the global instance
 */
export const isValidReactInstance = (reactInstance: any): boolean => {
  return reactInstance === globalReact;
};

/**
 * Higher-order component that ensures components use the global React instance
 * @param Component The component to wrap
 * @returns A wrapped component using the global React instance
 */
export const withGlobalReact = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => {
    const GlobalReact = getGlobalReact();
    return GlobalReact.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `WithGlobalReact(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Export the React version for debugging
export const REACT_VERSION = React.version; 