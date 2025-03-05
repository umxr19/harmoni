import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { progressService } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';
import '../styles/ProgressDashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const CORRECT_COLOR = '#4CAF50'; // Green for correct answers
const INCORRECT_COLOR = '#F44336'; // Red for incorrect answers

export const ProgressDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        setLoading(true);
        const response = await progressService.getUserProgress();
        
        // Check if we have meaningful data
        if (response.data && 
            response.data.categoryPerformance && 
            response.data.categoryPerformance.length > 0 &&
            response.data.totalQuestions > 0) {
          setStats(response.data);
          setHasData(true);
        } else {
          setHasData(false);
        }
      } catch (err) {
        logger.error('Failed to fetch progress data:', err);
        setError('Failed to load progress data. Please try again.');
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProgress();
  }, []);

  // Prepare data for category performance chart
  const prepareCategoryData = () => {
    if (!stats || !stats.categoryPerformance) return [];
    
    return stats.categoryPerformance.map((cat: any) => {
      const correct = Math.round((cat.accuracy / 100) * cat.questionsAttempted);
      const incorrect = cat.questionsAttempted - correct;
      
      return {
        name: cat.category,
        correct: correct,
        incorrect: incorrect
      };
    });
  };

  // Prepare data for progress over time chart
  const prepareTimeData = () => {
    if (!stats || !stats.previousAttempts) return [];
    
    return stats.previousAttempts.map((attempt: any) => ({
      date: new Date(attempt.date).toLocaleDateString(),
      score: attempt.score
    }));
  };

  // Prepare data for pie chart
  const preparePieData = () => {
    if (!stats || !stats.categoryPerformance) return [];
    
    return stats.categoryPerformance.map((cat: any) => ({
      name: cat.category,
      value: cat.questionsAttempted
    }));
  };

  if (loading) {
    return (
      <div className="progress-dashboard">
        <h1>Your Progress Dashboard</h1>
        <div className="loading-spinner">Loading your progress data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-dashboard">
        <h1>Your Progress Dashboard</h1>
        <div className="error-message">{error}</div>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="progress-dashboard">
        <h1>Your Progress Dashboard</h1>
        <div className="no-data-container">
          <div className="no-data-message">
            <h2>No Progress Data Yet</h2>
            <p>You haven't completed enough practice questions or exams to generate progress insights.</p>
            <p>Complete at least 5 questions to see your performance analytics.</p>
          </div>
          <div className="no-data-actions">
            <Link to="/practice" className="start-practice-button">
              Start Practice Now
            </Link>
            <Link to="/exams" className="take-exam-button">
              Take an Exam
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryData = prepareCategoryData();
  const timeData = prepareTimeData();
  const pieData = preparePieData();

  return (
    <div className="progress-dashboard">
      <h1>Your Progress Dashboard</h1>
      
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-value">{stats.totalQuestions}</div>
          <div className="stat-label">Questions Attempted</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.accuracy.toFixed(1)}%</div>
          <div className="stat-label">Overall Accuracy</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">
            {stats.categoryPerformance.length > 0 
              ? stats.categoryPerformance.sort((a: any, b: any) => b.accuracy - a.accuracy)[0].category 
              : 'N/A'}
          </div>
          <div className="stat-label">Strongest Subject</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">
            {stats.categoryPerformance.length > 0 
              ? stats.categoryPerformance.sort((a: any, b: any) => a.accuracy - b.accuracy)[0].category 
              : 'N/A'}
          </div>
          <div className="stat-label">Area for Improvement</div>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-card">
          <h3>Performance by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={categoryData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="correct" stackId="a" fill={CORRECT_COLOR} name="Correct" />
              <Bar dataKey="incorrect" stackId="a" fill={INCORRECT_COLOR} name="Incorrect" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-card">
          <h3>Progress Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={timeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                name="Score (%)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-card">
          <h3>Questions by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="recommendations-section">
        <h2>Recommended Focus Areas</h2>
        {stats.categoryPerformance && stats.categoryPerformance.length > 0 ? (
          <div className="focus-areas">
            {stats.categoryPerformance
              .sort((a: any, b: any) => a.accuracy - b.accuracy)
              .slice(0, 2)
              .map((category: any, index: number) => (
                <div key={index} className="focus-card">
                  <h3>{category.category}</h3>
                  <div className="focus-stats">
                    <div className="focus-accuracy">
                      <span className="accuracy-value">{category.accuracy.toFixed(1)}%</span>
                      <span className="accuracy-label">Accuracy</span>
                    </div>
                    <div className="focus-questions">
                      <span className="questions-value">{category.questionsAttempted}</span>
                      <span className="questions-label">Questions</span>
                    </div>
                  </div>
                  <Link to={`/practice?category=${category.category}`} className="practice-button">
                    Practice {category.category}
                  </Link>
                </div>
              ))}
          </div>
        ) : (
          <p className="no-data-message">Complete more questions to get personalized recommendations.</p>
        )}
      </div>
      
      <div className="dashboard-actions">
        <Link to="/practice" className="action-button practice">
          Start New Practice
        </Link>
        <Link to="/activity-history" className="action-button history">
          View Activity History
        </Link>
      </div>
    </div>
  );
}; 