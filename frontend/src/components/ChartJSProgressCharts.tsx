import React, { useState, useEffect, lazy, Suspense } from 'react';
import '../styles/ProgressCharts.css';
import ChartWrapper from './ChartWrapper';

// Define interfaces for data
interface CategoryData {
  name: string;
  completion: number;
  correct: number;
  incorrect: number;
  total: number;
}

interface TimeData {
  date: string;
  score: number;
  questions: number;
  timeSpent: number;
}

interface StrengthData {
  subject: string;
  score: number;
}

interface TimeSpentData {
  name: string;
  value: number;
}

interface QuestionsByCategoryData {
  name: string;
  value: number;
}

export interface ProgressChartsProps {
  categoryData: CategoryData[];
  timeData: TimeData[];
  strengthData: StrengthData[];
  timeSpentData: TimeSpentData[];
  questionsByCategory: QuestionsByCategoryData[];
  timeframe: string;
}

// Create a simple chart loading component
const ChartLoading = () => (
  <div className="chart-loading">Loading chart...</div>
);

// Create a simple chart error component
const ChartError = () => (
  <div className="chart-error">
    <p>Failed to load chart. Please try refreshing the page.</p>
  </div>
);

// Create a simple no data component
const NoData = () => (
  <div className="chart-card">
    <h3>No data available</h3>
    <p>Start practicing to see your progress charts!</p>
  </div>
);

// Create a simple chart container component
const ChartContainer = ({ height, children }: { height: number, children: React.ReactNode }) => (
  <div style={{ height: `${height}px`, width: '100%' }}>
    {children}
  </div>
);

// Lazy load the chart components
const LineChartComponent = lazy(() => import('./charts/LineChart'));
const BarChartComponent = lazy(() => import('./charts/BarChart'));
const PieChartComponent = lazy(() => import('./charts/PieChart'));
const RadarChartComponent = lazy(() => import('./charts/RadarChart'));

// Main component
export const ChartJSProgressCharts: React.FC<ProgressChartsProps> = (props) => {
  const {
    categoryData,
    timeData,
    strengthData,
    timeSpentData,
    questionsByCategory,
    timeframe
  } = props;
  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    setIsLoading(false);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  const COLORS = ['#ffcf96', '#ff9e7d', '#ff7eb3', '#ff8042', '#8884d8', '#82ca9d'];
  
  const hasData = categoryData.length > 0 || formattedTimeData.length > 0 || 
                  strengthData.length > 0 || timeSpentData.length > 0 ||
                  questionsByCategory.length > 0;

  if (!hasData) {
    return (
      <div className="progress-charts-container">
        <NoData />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="progress-charts-container">
        <div className="chart-card">
          <h3>Loading Charts</h3>
          <ChartLoading />
        </div>
      </div>
    );
  }

  // Get chart height based on screen size
  const getChartHeight = () => {
    if (windowWidth < 576) return 200;
    if (windowWidth < 768) return 250;
    return 300;
  };

  const chartHeight = getChartHeight();

  // Common chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: windowWidth < 576 ? 10 : 12
          }
        }
      },
      tooltip: {
        bodyFont: {
          size: windowWidth < 576 ? 10 : 12
        },
        titleFont: {
          size: windowWidth < 576 ? 12 : 14
        }
      }
    }
  };

  // Additional options for specific chart types
  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: windowWidth < 576 ? 10 : 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: windowWidth < 576 ? 10 : 12
          }
        }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: {
            size: windowWidth < 576 ? 10 : 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: windowWidth < 576 ? 10 : 12
          }
        }
      }
    }
  };

  const radarChartOptions = {
    ...chartOptions,
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          font: {
            size: windowWidth < 576 ? 10 : 12
          }
        },
        pointLabels: {
          font: {
            size: windowWidth < 576 ? 10 : 12
          }
        }
      }
    }
  };

  const pieChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Prepare data for charts
  const lineChartData = {
    labels: formattedTimeData.map(item => item.date),
    datasets: [
      {
        label: 'Score %',
        data: formattedTimeData.map(item => item.score),
        borderColor: '#ff9e7d',
        backgroundColor: 'rgba(255, 158, 125, 0.2)',
        tension: 0.1
      },
      {
        label: 'Questions Completed',
        data: formattedTimeData.map(item => item.questions),
        borderColor: '#ffcf96',
        backgroundColor: 'rgba(255, 207, 150, 0.2)',
        tension: 0.1
      }
    ]
  };

  const barChartData = {
    labels: categoryData.map(item => item.name),
    datasets: [
      {
        label: 'Completion %',
        data: categoryData.map(item => item.completion),
        backgroundColor: '#ffcf96',
      },
      {
        label: 'Correct %',
        data: categoryData.map(item => item.correct),
        backgroundColor: '#ff9e7d',
      },
      {
        label: 'Incorrect %',
        data: categoryData.map(item => item.incorrect),
        backgroundColor: '#ff7eb3',
      }
    ]
  };

  const pieChartData = {
    labels: questionsByCategory.map(item => item.name),
    datasets: [
      {
        data: questionsByCategory.map(item => item.value),
        backgroundColor: COLORS.slice(0, questionsByCategory.length),
        borderWidth: 1
      }
    ]
  };

  const radarChartData = {
    labels: strengthData.map(item => item.subject),
    datasets: [
      {
        label: 'Score',
        data: strengthData.map(item => item.score),
        backgroundColor: 'rgba(255, 158, 125, 0.6)',
        borderColor: '#ff9e7d',
        pointBackgroundColor: '#ff9e7d',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#ff9e7d'
      }
    ]
  };

  const timeSpentChartData = {
    labels: timeSpentData.map(item => item.name),
    datasets: [
      {
        data: timeSpentData.map(item => item.value),
        backgroundColor: COLORS.slice(0, timeSpentData.length),
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="progress-charts-container">
      {formattedTimeData.length > 0 && (
        <div className="chart-card">
          <h3>Performance Trend Over {displayTimeframe}</h3>
          <ChartWrapper>
            <ChartContainer height={chartHeight}>
              <Suspense fallback={<ChartLoading />}>
                <LineChartComponent data={lineChartData} options={lineChartOptions} />
              </Suspense>
            </ChartContainer>
          </ChartWrapper>
        </div>
      )}

      {categoryData.length > 0 && (
        <div className="chart-card">
          <h3>Completion Rates by Category</h3>
          <ChartWrapper>
            <ChartContainer height={chartHeight}>
              <Suspense fallback={<ChartLoading />}>
                <BarChartComponent data={barChartData} options={barChartOptions} />
              </Suspense>
            </ChartContainer>
          </ChartWrapper>
        </div>
      )}

      {questionsByCategory.length > 0 && (
        <div className="chart-card">
          <h3>Questions by Category</h3>
          <ChartWrapper>
            <ChartContainer height={chartHeight}>
              <Suspense fallback={<ChartLoading />}>
                <PieChartComponent data={pieChartData} options={pieChartOptions} />
              </Suspense>
            </ChartContainer>
          </ChartWrapper>
        </div>
      )}

      {strengthData.length > 0 && (
        <div className="chart-card">
          <h3>Strengths and Weaknesses</h3>
          <ChartWrapper>
            <ChartContainer height={chartHeight}>
              <Suspense fallback={<ChartLoading />}>
                <RadarChartComponent data={radarChartData} options={radarChartOptions} />
              </Suspense>
            </ChartContainer>
          </ChartWrapper>
        </div>
      )}

      {timeSpentData.length > 0 && (
        <div className="chart-card">
          <h3>Time Spent Studying</h3>
          <ChartWrapper>
            <ChartContainer height={chartHeight}>
              <Suspense fallback={<ChartLoading />}>
                <PieChartComponent data={timeSpentChartData} options={pieChartOptions} />
              </Suspense>
            </ChartContainer>
          </ChartWrapper>
        </div>
      )}
    </div>
  );
}; 