import React from 'react';
import '../styles/ProgressCharts.css';

interface SimpleProgressChartProps {
  title: string;
  value: number;
  maxValue: number;
  color?: string;
  label?: string;
}

const SimpleProgressChart: React.FC<SimpleProgressChartProps> = ({
  title,
  value,
  maxValue,
  color = '#4f46e5',
  label
}) => {
  const percentage = Math.min(100, Math.round((value / maxValue) * 100));
  
  return (
    <div className="progress-chart-card">
      <h3 className="chart-title">{title}</h3>
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color 
          }}
        />
      </div>
      <div className="progress-info">
        <span className="progress-value">{value}</span>
        <span className="progress-label">{label || `of ${maxValue}`}</span>
        <span className="progress-percentage">{percentage}%</span>
      </div>
    </div>
  );
};

export default SimpleProgressChart; 