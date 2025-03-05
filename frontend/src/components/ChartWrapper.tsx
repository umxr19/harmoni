import React from 'react';
import '../styles/ChartWrapper.css';

interface ChartWrapperProps {
  children: React.ReactNode;
}

/**
 * ChartWrapper - A component that provides consistent styling for charts
 * This wrapper ensures charts have consistent appearance and responsive behavior
 * 
 * @param {React.ReactNode} children - The chart components to render
 */
const ChartWrapper: React.FC<ChartWrapperProps> = ({ children }) => {
  return (
    <div className="chart-wrapper">
      {children}
    </div>
  );
};

export default ChartWrapper; 