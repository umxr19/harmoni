import React, { useState, useEffect } from 'react';
import logger from '../utils/logger';

interface SafeChartProps {
  children: React.ReactNode;
}

/**
 * SafeChart - A component that safely renders Chart.js components only on the client side
 * This helps prevent any potential rendering issues
 * 
 * @param {React.ReactNode} children - The chart components to render
 */
const SafeChart: React.FC<SafeChartProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleError = (error: Error) => {
    logger.error('Chart rendering error:', error);
    setHasError(true);
  };

  // Show loading state while mounting
  if (!mounted) {
    return <div className="chart-loading">Loading chart...</div>;
  }

  // Show error state if there's an error
  if (hasError) {
    return (
      <div className="chart-error">
        <p>Failed to load chart. Please try refreshing the page.</p>
      </div>
    );
  }

  // Wrap children in error handler
  return (
    <>
      {React.Children.map(children, child => {
        try {
          return child;
        } catch (error) {
          handleError(error as Error);
          return (
            <div className="chart-error">
              <p>Failed to render chart. Please try refreshing the page.</p>
            </div>
          );
        }
      })}
    </>
  );
};

export default SafeChart; 