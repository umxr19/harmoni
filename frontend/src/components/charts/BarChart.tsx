import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartJSWrapper from '../ChartJSWrapper';
import { withGlobalReact } from '../../utils/reactUtils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
  options?: any;
}

// Create the base component
const BaseBarChart: React.FC<BarChartProps> = ({ data, options }) => {
  return (
    <ChartJSWrapper>
      <Bar data={data} options={options} />
    </ChartJSWrapper>
  );
};

// Export the wrapped component
const BarChart = withGlobalReact(BaseBarChart);
export default BarChart; 