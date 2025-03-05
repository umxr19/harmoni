import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { getGlobalReact } from '../../utils/reactUtils';
import ChartJSWrapper from '../ChartJSWrapper';

// Ensure we're using the global React instance
const GlobalReact = getGlobalReact() || React;

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface PieChartProps {
  data: any;
  options: any;
}

// Use the global React instance for the component
const PieChart: React.FC<PieChartProps> = ({ data, options }) => {
  return (
    <ChartJSWrapper>
      <Pie data={data} options={options} />
    </ChartJSWrapper>
  );
};

export default PieChart; 