import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSafeAuth } from '../hooks/useSafeAuth';
import { classroomService, questionService } from '../services/api';
import analyticsService from '../services/analyticsService';
import '../styles/TeacherDashboard.css';
import logger from '../utils/logger';

interface Classroom {
  _id: string;
  name: string;
  studentCount: number;
}

interface Question {
  _id: string;
  text: string;
  category: string;
}

interface TeacherAnalytics {
  totalStudents: number;
  totalClassrooms: number;
  activeAssignments: number;
  averageScore: number;
  classroomPerformance: {
    name: string;
    studentCount: number;
    averageScore: number;
    completionRate: number;
  }[];
}

export const TeacherDashboard: React.FC = () => {
  const [recentClassrooms, setRecentClassrooms] = useState<Classroom[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(false);
  const { currentUser } = useSafeAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let isMockData = false;
        
        // Fetch recent classrooms
        const classroomsResponse = await classroomService.getTeacherClassrooms();
        setRecentClassrooms(classroomsResponse.data as Classroom[] || []);
        
        // Check if using mock data 
        if (classroomsResponse.isMock) {
          logger.info('Using mock classroom data');
          isMockData = true;
        }
        
        // Fetch recent questions
        const questionsResponse = await questionService.getQuestions(1, 3);
        setRecentQuestions(questionsResponse.data as Question[] || []);
        
        // Check if using mock data
        if (questionsResponse.isMock) {
          logger.info('Using mock question data');
          isMockData = true;
        }
        
        // Fetch teacher analytics
        try {
          const analyticsResponse = await analyticsService.getTeacherAnalytics();
          setAnalytics(analyticsResponse || null);
        } catch (analyticErr) {
          logger.error('Failed to fetch analytics data:', analyticErr);
          // Set empty analytics rather than null to avoid undefined access
          setAnalytics({
            totalStudents: 0,
            totalClassrooms: 0,
            activeAssignments: 0,
            averageScore: 0,
            classroomPerformance: []
          });
          isMockData = true;
        }
        
        setUsingMockData(isMockData);
        setError(null);
      } catch (err) {
        logger.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  return (
    <div className="teacher-dashboard-container">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <p className="welcome-message">Welcome back, {currentUser?.username || 'Teacher'}!</p>
        {usingMockData && (
          <div className="mock-data-indicator">
            <p style={{ color: 'orange', fontWeight: 'bold', padding: '8px', background: '#fff3e0', borderRadius: '4px', fontSize: '0.9rem' }}>
              ⚠️ Using mock data - Some backend services may not be available
            </p>
          </div>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-content">
        {/* Analytics Overview */}
        {loading ? (
          <div className="loading-spinner">Loading analytics...</div>
        ) : analytics ? (
          <div className="analytics-overview">
            <div className="analytics-card">
              <h3>Total Students</h3>
              <p className="analytics-value">{analytics.totalStudents}</p>
            </div>
            <div className="analytics-card">
              <h3>Total Classrooms</h3>
              <p className="analytics-value">{analytics.totalClassrooms}</p>
            </div>
            <div className="analytics-card">
              <h3>Active Assignments</h3>
              <p className="analytics-value">{analytics.activeAssignments}</p>
            </div>
            <div className="analytics-card">
              <h3>Average Score</h3>
              <p className="analytics-value">{analytics.averageScore}%</p>
            </div>
          </div>
        ) : null}
        
        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="dashboard-actions">
            <Link to="/classrooms/manage" className="dashboard-button classroom">
              Manage Classrooms
            </Link>
            <Link to="/questions/create" className="dashboard-button question">
              Create Question
            </Link>
            <Link to="/assignments/create" className="dashboard-button assignment">
              Create Assignment
            </Link>
            <Link to="/exams/create" className="dashboard-button exam">
              Create Exam
            </Link>
          </div>
        </div>
        
        {/* Classroom Performance */}
        {analytics && analytics.classroomPerformance && Array.isArray(analytics.classroomPerformance) && analytics.classroomPerformance.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Classroom Performance</h2>
            </div>
            <div className="classroom-performance">
              {analytics.classroomPerformance.map((classroom, index) => (
                <div key={index} className="performance-card">
                  <h3>{classroom.name}</h3>
                  <div className="performance-stats">
                    <div className="stat">
                      <span className="label">Students:</span>
                      <span className="value">{classroom.studentCount}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Avg. Score:</span>
                      <span className="value">{classroom.averageScore}%</span>
                    </div>
                    <div className="stat">
                      <span className="label">Completion:</span>
                      <span className="value">{classroom.completionRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="dashboard-row">
          {/* Recent Classrooms */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Classrooms</h2>
              <Link to="/classrooms/manage" className="action-link">View All</Link>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading classrooms...</div>
            ) : recentClassrooms.length > 0 ? (
              <div className="classrooms-list">
                {recentClassrooms.map(classroom => (
                  <Link 
                    key={classroom._id} 
                    to={`/classrooms/${classroom._id}`}
                    className="classroom-card"
                  >
                    <h3>{classroom.name}</h3>
                    <p>{classroom.studentCount} students</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="no-data-message">No classrooms found. Create your first classroom!</p>
            )}
          </div>
          
          {/* Recent Questions */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Questions</h2>
              <Link to="/questions/manage" className="action-link">View All</Link>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading questions...</div>
            ) : recentQuestions.length > 0 ? (
              <div className="questions-list">
                {recentQuestions.map(question => (
                  <div key={question._id} className="question-card">
                    <h3>{question.text}</h3>
                    <p>Category: {question.category}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data-message">No questions created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 