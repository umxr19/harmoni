import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ProgressChartsProps } from '../types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  componentName: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      componentName: 'unknown'
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      componentName: 'unknown'
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
      componentName: this.props.children && typeof this.props.children === 'object' && 'type' in this.props.children
        ? (this.props.children.type as { displayName?: string; name?: string }).displayName ||
          (this.props.children.type as { displayName?: string; name?: string }).name ||
          'unknown'
        : 'unknown'
    });
    
    // Log the error
    console.error('Error caught by ErrorBoundary:', {
      error,
      errorInfo,
      componentName: this.state.componentName
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong in {this.state.componentName}</h2>
          <details>
            <summary>Error Details</summary>
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