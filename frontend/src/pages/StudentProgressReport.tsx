import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { progressService } from '../services/api';
import '../styles/StudentProgressReport.css';
import logger from '../utils/logger';

interface ProgressData {
  subject: string;
  score: number;
  totalQuestions: number;
  completedQuestions: number;
  averageTime: number;
}

export const StudentProgressReport: React.FC = () => {
  const [studentName, setStudentName] = useState('');
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentProgress();
  }, [studentId]);

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      
      // Mock data for now
      setStudentName('Alice Smith');
      setProgressData([
        {
          subject: 'Mathematics',
          score: 85,
          totalQuestions: 100,
          completedQuestions: 85,
          averageTime: 45
        },
        {
          subject: 'Science',
          score: 92,
          totalQuestions: 80,
          completedQuestions: 75,
          averageTime: 38
        },
        {
          subject: 'English',
          score: 78,
          totalQuestions: 90,
          completedQuestions: 70,
          averageTime: 52
        }
      ]);
      
      setError(null);
    } catch (err) {
      logger.error('Failed to fetch student progress:', err);
      setError('Failed to load student progress data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="loading-spinner">Loading progress data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="progress-report-container">
      <div className="report-header">
        <div>
          <h1>Student Progress Report</h1>
          <h2>{studentName}</h2>
          <p className="report-date">Generated on: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="report-actions">
          <button className="back-button" onClick={() => navigate(-1)}>
            Back
          </button>
          <button className="print-button" onClick={handlePrint}>
            Print Report
          </button>
        </div>
      </div>

      <div className="progress-summary">
        <div className="summary-card">
          <h3>Overall Performance</h3>
          <div className="performance-score">
            {Math.round(progressData.reduce((acc, curr) => acc + curr.score, 0) / progressData.length)}%
          </div>
          <p>Average score across all subjects</p>
        </div>
        
        <div className="summary-card">
          <h3>Completion Rate</h3>
          <div className="completion-rate">
            {Math.round(
              (progressData.reduce((acc, curr) => acc + curr.completedQuestions, 0) / 
              progressData.reduce((acc, curr) => acc + curr.totalQuestions, 0)) * 100
            )}%
          </div>
          <p>Questions completed vs. total assigned</p>
        </div>
        
        <div className="summary-card">
          <h3>Average Time</h3>
          <div className="average-time">
            {Math.round(progressData.reduce((acc, curr) => acc + curr.averageTime, 0) / progressData.length)}s
          </div>
          <p>Average time per question</p>
        </div>
      </div>

      <div className="subject-progress">
        <h2>Progress by Subject</h2>
        
        <div className="subjects-grid">
          {progressData.map((subject, index) => (
            <div key={index} className="subject-card">
              <h3>{subject.subject}</h3>
              
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${subject.score}%` }}
                ></div>
                <span className="progress-label">{subject.score}%</span>
              </div>
              
              <div className="subject-stats">
                <div className="stat">
                  <span className="stat-label">Completed:</span>
                  <span className="stat-value">{subject.completedQuestions} / {subject.totalQuestions}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Avg. Time:</span>
                  <span className="stat-value">{subject.averageTime}s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="recommendations">
        <h2>Recommendations</h2>
        <ul className="recommendations-list">
          <li>Focus more practice on English to improve scores.</li>
          <li>Continue strong performance in Science.</li>
          <li>Work on reducing time spent on Mathematics questions.</li>
        </ul>
      </div>
    </div>
  );
}; 