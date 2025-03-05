import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { getGlobalReact } from '../../utils/reactUtils';
import ChartJSWrapper from '../ChartJSWrapper';

// Ensure we're using the global React instance
const GlobalReact = getGlobalReact() || React;

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  data: any;
  options: any;
}

// Use the global React instance for the component
const RadarChart: React.FC<RadarChartProps> = ({ data, options }) => {
  return (
    <ChartJSWrapper>
      <Radar data={data} options={options} />
    </ChartJSWrapper>
  );
};

export default RadarChart; 