import React from 'react';
import '../styles/BasicCharts.css';

interface BasicChartsProps {
  categoryData: any[];
  timeData: any[];
  questionsByCategory: any[];
  timeframe: string;
}

export const BasicCharts: React.FC<BasicChartsProps> = ({
  categoryData,
  timeData,
  questionsByCategory,
  timeframe
}) => {
  // Format the timeframe for display
  const displayTimeframe = timeframe === '1month' ? '1 Month' : 
                          timeframe === '6months' ? '6 Months' : '1 Year';

  return (
    <div className="basic-charts-container">
      {timeData.length > 0 && (
        <div className="chart-card">
          <h3>Performance Trend Over {displayTimeframe}</h3>
          <div className="basic-chart">
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#8884d8' }}></span>
                <span>Score %</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#82ca9d' }}></span>
                <span>Questions Completed</span>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Score %</th>
                  <th>Questions</th>
                </tr>
              </thead>
              <tbody>
                {timeData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.score}%</td>
                    <td>{item.questions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {categoryData.length > 0 && (
        <div className="chart-card">
          <h3>Completion Rates by Category</h3>
          <div className="basic-chart">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Completion %</th>
                  <th>Correct %</th>
                  <th>Incorrect %</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.completion}%</td>
                    <td>{item.correct}%</td>
                    <td>{item.incorrect}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {questionsByCategory.length > 0 && (
        <div className="chart-card">
          <h3>Questions by Category</h3>
          <div className="basic-chart">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Questions</th>
                </tr>
              </thead>
              <tbody>
                {questionsByCategory.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}; 