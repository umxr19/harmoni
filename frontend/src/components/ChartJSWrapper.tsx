import React, { Component, ErrorInfo, useEffect } from 'react';
import { getGlobalReact, REACT_VERSION } from '../utils/reactUtils';
import logger from '../utils/logger';

// Extend Window interface
declare global {
  interface Window {
    React: typeof React;
    ReactDOM: typeof import('react-dom');
  }
}

interface ChartJSWrapperProps {
  children: React.ReactNode;
}

interface ChartJSWrapperState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component for Chart.js
 */
class ChartErrorBoundary extends Component<ChartJSWrapperProps, ChartJSWrapperState> {
  constructor(props: ChartJSWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ChartJSWrapperState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Chart rendering error:', error);
    logger.error('Error info:', errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="chart-error">
          <p>Failed to render chart. Please try refreshing the page.</p>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error details</summary>
              <pre>{this.state.error?.message}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * A wrapper component for Chart.js components that ensures proper React instance usage
 * and provides error handling
 */
const ChartJSWrapper: React.FC<ChartJSWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Log React version on mount for debugging
    logger.debug(`Using React version: ${REACT_VERSION}`);
  }, []);

  return (
    <ChartErrorBoundary>
      <div className="chart-js-wrapper">
        {children}
      </div>
    </ChartErrorBoundary>
  );
};

export default ChartJSWrapper; 