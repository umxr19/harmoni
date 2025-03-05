import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BasicCharts } from './BasicCharts';
import logger from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Set the errorInfo in state
    this.setState({ errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Check if we're trying to render charts
      const childrenType = React.isValidElement(this.props.children) ? 
        this.props.children.type.name : 'unknown';
      
      // If we're rendering charts and they fail, show the basic charts
      if (childrenType.includes('Chart')) {
        const chartProps = React.isValidElement(this.props.children) ? 
          this.props.children.props : {};
        
        return (
          <div>
            <div className="error-notification">
              <p>Charts couldn't be displayed. Showing data in table format instead.</p>
              <details>
                <summary>Error details (click to expand)</summary>
                <pre>{this.state.error?.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            </div>
            <BasicCharts 
              categoryData={chartProps.categoryData || []}
              timeData={chartProps.timeData || []}
              questionsByCategory={chartProps.questionsByCategory || []}
              timeframe={chartProps.timeframe}
            />
          </div>
        );
      }
      
      // Default error UI
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong.</h2>
          <p>Please try refreshing the page.</p>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.toString()}</pre>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 