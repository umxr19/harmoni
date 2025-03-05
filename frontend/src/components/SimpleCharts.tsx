import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import ChartWrapper from './ChartWrapper';
import '../styles/ProgressCharts.css';

interface SimpleChartsProps {
  categoryData: any[];
  timeData: any[];
  questionsByCategory: any[];
  timeframe: string;
}

export const SimpleCharts: React.FC<SimpleChartsProps> = ({
  categoryData,
  timeData,
  questionsByCategory,
  timeframe
}) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Format the timeframe for display
  const displayTimeframe = timeframe === '1month' ? '1 Month' : 
                          timeframe === '6months' ? '6 Months' : '1 Year';

  // Format dates for better display
  const formattedTimeData = timeData.map(item => ({
    ...item,
    date: typeof item.date === 'string' ? 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
      item.date
  }));

  return (
    <div className="progress-charts-container">
      {timeData.length > 0 && (
        <div className="chart-card">
          <h3>Performance Trend Over {displayTimeframe}</h3>
          <ChartWrapper>
            <LineChart
              width={500}
              height={300}
              data={formattedTimeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#8884d8" name="Score %" />
              <Line type="monotone" dataKey="questions" stroke="#82ca9d" name="Questions Completed" />
            </LineChart>
          </ChartWrapper>
        </div>
      )}

      {categoryData.length > 0 && (
        <div className="chart-card">
          <h3>Completion Rates by Category</h3>
          <ChartWrapper>
            <BarChart
              width={500}
              height={300}
              data={categoryData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completion" fill="#8884d8" name="Completion %" />
              <Bar dataKey="correct" fill="#82ca9d" name="Correct %" />
              <Bar dataKey="incorrect" fill="#FF8042" name="Incorrect %" />
            </BarChart>
          </ChartWrapper>
        </div>
      )}

      {questionsByCategory.length > 0 && (
        <div className="chart-card">
          <h3>Questions by Category</h3>
          <ChartWrapper>
            <PieChart
              width={500}
              height={300}
            >
              <Pie
                data={questionsByCategory}
                cx={250}
                cy={150}
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {questionsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ChartWrapper>
        </div>
      )}
    </div>
  );
}; 