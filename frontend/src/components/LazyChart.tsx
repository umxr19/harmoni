import React, { Suspense } from 'react';
import ChartWrapper from './ChartWrapper';

interface LazyChartProps {
  children: React.ReactNode;
  title: string;
}

const LazyChart: React.FC<LazyChartProps> = ({ children, title }) => {
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <Suspense fallback={<div>Loading chart...</div>}>
        <ChartWrapper>
          {children}
        </ChartWrapper>
      </Suspense>
    </div>
  );
};

export default LazyChart; 