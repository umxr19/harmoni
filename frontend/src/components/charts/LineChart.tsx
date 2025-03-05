import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ChartJSWrapper from '../ChartJSWrapper';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: any;
  options: any;
}

// Use a simple functional component
const LineChart: React.FC<LineChartProps> = ({ data, options }) => {
  return (
    <ChartJSWrapper>
      <Line data={data} options={options} />
    </ChartJSWrapper>
  );
};

export default LineChart; 