import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { activityTrackingService, classroomService } from '../services/api';
import analyticsService from '../services/analyticsService';
import { ProgressCharts } from '../components/ProgressCharts';
import ErrorBoundary from '../components/ErrorBoundary';
import { getPersonalizedWelcomeMessage } from '../utils/messageUtils';
import '../styles/StudentDashboard.css';
import logger from '../utils/logger';

// Define timeframe options
type TimeframeOption = '1 month' | '6 months' | '1 year';

// Update the timeframe mapping in StudentDashboard.tsx
const timeframeMapping = {
  '1 month': '1month',
  '6 months': '6months',
  '1 year': '1year'
};

// Define interfaces for classroom and assignment data
interface Classroom {
  _id: string;
  name: string;
  description: string;
  teacherId: string;
  teacherName?: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  classroomId: string;
  classroomName?: string;
  completed?: boolean;
}

interface Activity {
  id?: string;
  type?: string;
  title?: string;
  date: string | Date;
  action?: string;
  score: number;
  total: number;
  category?: string;
}

interface Analytics {
  stats: {
    completionRate: number;
    questionsAttempted: number;
    questionsCorrect: number;
    accuracy: number;
    streak: number;
    timeSpent: number;
  };
  categoryData: any[];
  timeData: any[];
  strengthData: any[];
  timeSpentData: any[];
  questionsByCategory: any[];
  recentActivity: Activity[];
}

export const StudentDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [timeframe, setTimeframe] = useState<string>('1month');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classroomsLoading, setClassroomsLoading] = useState<boolean>(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState<boolean>(true);
  const { currentUser } = useAuth();
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    fetchData();
    fetchClassroomsAndAssignments();
  }, [timeframe]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setUsingMockData(false);
    
    try {
      logger.info(`Fetching analytics for timeframe: ${timeframe}`);
      
      // Fetch student analytics
      const analyticsResponse = await analyticsService.getStudentAnalytics();
      logger.info('Analytics response:', analyticsResponse);
      
      // Check if we got a direct object (mock data) or a nested data structure (API response)
      if (analyticsResponse.data) {
        // API response structure
        setAnalytics(analyticsResponse.data);
        
        // If we have analytics data but no recent activity, fetch it separately
        if (!analyticsResponse.data.recentActivity || analyticsResponse.data.recentActivity.length === 0) {
          try {
            const activityResponse = await analyticsService.getUserActivity(10); // Get last 10 activities
            if (activityResponse.data) {
              // Update analytics with the activity data
              setAnalytics(prev => ({
                ...prev!,
                recentActivity: activityResponse.data
              }));
            }
          } catch (activityError) {
            logger.error('Error fetching recent activity:', activityError);
            // Continue with the analytics data we have
          }
        }
      } else if (analyticsResponse.performance) {
        // Mock data structure - convert to expected format
        logger.info('Using mock analytics data');
        setUsingMockData(true);
        
        // Transform the mock data structure to match our component's expected format
        setAnalytics({
          stats: {
            completionRate: analyticsResponse.progress?.questionsCompleted && analyticsResponse.progress?.totalQuestions 
              ? (analyticsResponse.progress.questionsCompleted / analyticsResponse.progress.totalQuestions * 100)
              : 0,
            questionsAttempted: analyticsResponse.progress?.questionsCompleted || 0,
            questionsCorrect: analyticsResponse.progress?.questionsCompleted && analyticsResponse.performance?.overall
              ? Math.floor(analyticsResponse.progress.questionsCompleted * analyticsResponse.performance.overall / 100)
              : 0,
            accuracy: analyticsResponse.performance?.overall || 0,
            streak: 3, // Mock streak
            timeSpent: 120 // Mock time spent (minutes)
          },
          categoryData: analyticsResponse.performance?.byCategory
            ? analyticsResponse.performance.byCategory.map((cat: { category: string; score: number }) => ({
                name: cat.category,
                value: cat.score
              }))
            : [],
          timeData: [
            { name: 'Week 1', questions: 10 },
            { name: 'Week 2', questions: 15 },
            { name: 'Week 3', questions: 12 },
            { name: 'Week 4', questions: 20 }
          ],
          strengthData: [
            { name: 'Algebra', score: 85 },
            { name: 'Geometry', score: 70 },
            { name: 'Arithmetic', score: 90 }
          ],
          timeSpentData: [
            { name: 'Math', minutes: 45 },
            { name: 'English', minutes: 35 },
            { name: 'Science', minutes: 25 }
          ],
          questionsByCategory: [
            { name: 'Math', completed: 20, total: 30 },
            { name: 'English', completed: 15, total: 25 },
            { name: 'Science', completed: 10, total: 20 }
          ],
          recentActivity: [
            { 
              type: 'practice',
              title: 'Math Practice',
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              score: 8,
              total: 10,
              category: 'Math'
            },
            {
              type: 'exam',
              title: 'English Test',
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              score: 85,
              total: 100,
              category: 'English'
            }
          ]
        });
      } else {
        logger.warn('No analytics data returned from API');
        setUsingMockData(true);
        setError('Could not load analytics data');
      }
    } catch (error) {
      logger.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Using mock data instead.');
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassroomsAndAssignments = async () => {
    setClassroomsLoading(true);
    setAssignmentsLoading(true);
    
    try {
      // Fetch student's classrooms
      logger.info('Fetching student classrooms...');
      const classroomsResponse = await classroomService.getStudentClassrooms();
      
      if (classroomsResponse.data) {
        setClassrooms(classroomsResponse.data);
      }
      
      // Fetch student's assignments
      logger.info('Fetching student assignments...');
      const assignmentsResponse = await classroomService.getStudentAssignments();
      
      if (assignmentsResponse.data) {
        // Sort assignments by due date (closest first)
        const sortedAssignments = [...assignmentsResponse.data].sort((a, b) => {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        
        setAssignments(sortedAssignments);
      }
    } catch (error) {
      logger.error('Error fetching classrooms and assignments:', error);
    } finally {
      setClassroomsLoading(false);
      setAssignmentsLoading(false);
    }
  };

  const handleTimeframeChange = (option: TimeframeOption) => {
    const mappedTimeframe = timeframeMapping[option];
    setTimeframe(mappedTimeframe);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate days remaining until due date
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return '1 day left';
    } else {
      return `${diffDays} days left`;
    }
  };

  // Safe date formatter - prevents errors with undefined or invalid dates
  const safeDateFormat = (dateValue: string | Date | undefined) => {
    if (!dateValue) return 'Unknown date';
    
    try {
      if (typeof dateValue === 'string') {
        return formatDate(dateValue);
      } else if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return 'Invalid date';
    } catch (error) {
      logger.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  // Safe score calculator - prevents division by zero errors
  const safeScorePercentage = (score: number, total: number) => {
    if (!total) return '0%';
    try {
      return `${Math.round((score / total) * 100)}%`;
    } catch (error) {
      return '0%';
    }
  };

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="timeframe-selector">
          <button 
            className={timeframe === '1month' ? 'active' : ''} 
            onClick={() => handleTimeframeChange('1 month')}
          >
            1 Month
          </button>
          <button 
            className={timeframe === '6months' ? 'active' : ''} 
            onClick={() => handleTimeframeChange('6 months')}
          >
            6 Months
          </button>
          <button 
            className={timeframe === '1year' ? 'active' : ''} 
            onClick={() => handleTimeframeChange('1 year')}
          >
            1 Year
          </button>
        </div>
      </div>
      
      {usingMockData && (
        <div className="mock-data-notice">
          <p>Using mock data for demonstration purposes. In production, this would show your actual progress.</p>
        </div>
      )}
      
      <div className="dashboard-grid">
        {/* Performance & Analytics Column */}
        <div className="dashboard-column main-column">
          {/* Performance Stats */}
          <div className="dashboard-card stats-card">
            <div className="section-header">
              <h2>Performance Overview</h2>
            </div>
            {loading ? (
              <div className="loading-spinner">Loading analytics...</div>
            ) : analytics ? (
              <div className="analytics-overview">
                <div className="analytics-card">
                  <h3>Completion Rate</h3>
                  <p className="analytics-value">{analytics.stats.completionRate}%</p>
                </div>
                <div className="analytics-card">
                  <h3>Questions Attempted</h3>
                  <p className="analytics-value">{analytics.stats.questionsAttempted}</p>
                </div>
                <div className="analytics-card">
                  <h3>Accuracy</h3>
                  <p className="analytics-value">{analytics.stats.accuracy}%</p>
                </div>
                <div className="analytics-card">
                  <h3>Current Streak</h3>
                  <p className="analytics-value">
                    {analytics.stats.streak} <span className="streak-icon">🔥</span>
                  </p>
                </div>
                <div className="analytics-card">
                  <h3>Time Spent</h3>
                  <p className="analytics-value">{analytics.stats.timeSpent} min</p>
                </div>
              </div>
            ) : null}
          </div>
          
          {/* Progress Analytics Charts */}
          <div className="dashboard-card progress-card">
            <div className="section-header">
              <h2>Analytics & Progress</h2>
            </div>
            {analytics && (
              <div className="charts-section">
                <ErrorBoundary fallback={<div>Error loading charts. Please refresh the page.</div>}>
                  <ProgressCharts 
                    categoryData={analytics.categoryData || []}
                    timeData={analytics.timeData || []}
                    strengthData={analytics.strengthData || []}
                    timeSpentData={analytics.timeSpentData || []}
                    questionsByCategory={analytics.questionsByCategory || []}
                    timeframe={timeframe}
                  />
                </ErrorBoundary>
              </div>
            )}
          </div>
          
          {/* Recent Activity */}
          <div className="dashboard-card activity-card">
            <div className="card-header">
              <h3>Recent Activity</h3>
              <Link to="/activity-history" className="view-all-link">View All</Link>
            </div>
            <div className="activity-list">
              {loading ? (
                <div className="loading-spinner">Loading activity...</div>
              ) : analytics && analytics.recentActivity && analytics.recentActivity.length > 0 ? (
                (analytics.recentActivity || []).slice(0, 5).map((activity, index) => {
                  // Add safety check for activity object
                  if (!activity) return null;
                  
                  return (
                    <div key={index} className="activity-card">
                      <div className="activity-details">
                        <h3>{activity?.action || activity?.title || 'Activity'}</h3>
                        <p className="activity-date">{safeDateFormat(activity?.date)}</p>
                      </div>
                      <div className="activity-score">
                        <p className="score">{activity?.score ?? 0}/{activity?.total ?? 0}</p>
                        <p className="score-percentage">{safeScorePercentage(activity?.score ?? 0, activity?.total ?? 0)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="no-data-message">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Quick Views Column */}
        <div className="dashboard-column side-column">
          {/* My Classrooms */}
          <div className="dashboard-card classrooms-card">
            <div className="section-header">
              <h2>My Classrooms</h2>
              <Link to="/classrooms" className="action-link">View All</Link>
            </div>
            
            {classroomsLoading ? (
              <div className="loading-spinner">Loading classrooms...</div>
            ) : classrooms.length > 0 ? (
              <div className="classrooms-grid">
                {classrooms.slice(0, 3).map(classroom => (
                  <Link 
                    key={classroom._id} 
                    to={`/classrooms/${classroom._id}`}
                    className="classroom-card"
                  >
                    <h3>{classroom.name}</h3>
                    <p className="classroom-description">{classroom.description}</p>
                    <p className="classroom-teacher">Teacher: {classroom.teacherName || 'Unknown'}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="no-data-message">You are not enrolled in any classrooms.</p>
            )}
          </div>
          
          {/* Upcoming Assignments */}
          <div className="dashboard-card assignments-card">
            <div className="section-header">
              <h2>Upcoming Assignments</h2>
              <Link to="/assignments" className="action-link">View All</Link>
            </div>
            
            {assignmentsLoading ? (
              <div className="loading-spinner">Loading assignments...</div>
            ) : assignments.length > 0 ? (
              <div className="assignments-list">
                {assignments.slice(0, 3).map(assignment => (
                  <Link 
                    key={assignment._id} 
                    to={`/assignments/${assignment._id}`}
                    className="assignment-card"
                  >
                    <div className="assignment-details">
                      <h3>{assignment.title}</h3>
                      <p className="assignment-classroom">{assignment.classroomName}</p>
                    </div>
                    <div className="assignment-due-date">
                      <p className="due-date">{formatDate(assignment.dueDate)}</p>
                      <p className={`days-remaining ${getDaysRemaining(assignment.dueDate) === 'Overdue' ? 'overdue' : ''}`}>
                        {getDaysRemaining(assignment.dueDate)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="no-data-message">No upcoming assignments.</p>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="dashboard-card quick-actions-card">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
              <Link to="/practice" className="quick-action-button">
                Practice Questions
              </Link>
              <Link to="/exams" className="quick-action-button">
                Take an Exam
              </Link>
              <Link to="/study-schedule" className="quick-action-button">
                Study Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 