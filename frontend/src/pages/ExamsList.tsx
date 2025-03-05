import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { examService } from '../services/api';
import { Exam } from '../types';
import '../styles/ExamsList.css';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';

export const ExamsList: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingExams, setCreatingExams] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const navigate = useNavigate();

  const fallbackExams = [
    {
      _id: 'fallback1',
      title: 'Verbal Reasoning Practice (Fallback)',
      description: 'A focused exam to practice verbal reasoning skills for the 11+ exam.',
      duration: 20,
      questions: Array(10).fill(''),
      category: ['Verbal Reasoning', '11+ Preparation'],
      difficulty: 'medium',
      createdBy: { username: 'System' },
      isPublic: true
    },
    {
      _id: 'fallback2',
      title: 'Mathematics Practice (Fallback)',
      description: 'Sharpen your math skills with this 11+ focused practice exam.',
      duration: 25,
      questions: Array(10).fill(''),
      category: ['Mathematics', '11+ Preparation'],
      difficulty: 'medium',
      createdBy: { username: 'System' },
      isPublic: true
    }
  ];

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await examService.getPublicExams();
        
        if (response.usingMockData) {
          setUsingMockData(true);
        }
        
        if (response.data && response.data.length > 0) {
          setExams(response.data as Exam[]);
        } else {
          // Use mock data if no exams are returned
          setExams([
            {
              _id: 'mock-exam-1',
              title: '11+ Mathematics Practice Exam',
              description: 'A comprehensive mathematics exam covering all key topics for 11+ preparation.',
              duration: 60,
              questions: Array(25).fill(''),
              category: ['Mathematics', '11+ Preparation'],
              difficulty: 'medium',
              createdBy: { _id: 'system', username: 'System' },
              isPublic: true,
              createdAt: new Date().toISOString()
            },
            {
              _id: 'mock-exam-2',
              title: '11+ English Practice Exam',
              description: 'Test your English skills with this practice exam covering comprehension, grammar, and vocabulary.',
              duration: 45,
              questions: Array(20).fill(''),
              category: ['English', '11+ Preparation'],
              difficulty: 'medium',
              createdBy: { _id: 'system', username: 'System' },
              isPublic: true,
              createdAt: new Date().toISOString()
            },
            {
              _id: 'mock-exam-3',
              title: 'Verbal Reasoning Test',
              description: 'Challenge your verbal reasoning skills with this comprehensive practice test.',
              duration: 30,
              questions: Array(15).fill(''),
              category: ['Verbal Reasoning', '11+ Preparation'],
              difficulty: 'hard',
              createdBy: { _id: 'system', username: 'System' },
              isPublic: true,
              createdAt: new Date().toISOString()
            }
          ]);
          setUsingMockData(true);
        }
      } catch (err) {
        logger.error('Failed to fetch exams:', err);
        setError('Failed to load exams. Please try again.');
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleCreateSampleExams = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setCreatingExams(true);
      // In a real app, call the API to create sample exams
      // await examService.createSampleExams();
      
      // For now, just add mock exams
      setExams([
        {
          _id: 'mock-exam-1',
          title: '11+ Mathematics Practice Exam',
          description: 'A comprehensive mathematics exam covering all key topics for 11+ preparation.',
          duration: 60,
          questions: Array(25).fill(''),
          category: ['Mathematics', '11+ Preparation'],
          difficulty: 'medium',
          createdBy: { _id: 'system', username: 'System' },
          isPublic: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: 'mock-exam-2',
          title: '11+ English Practice Exam',
          description: 'Test your English skills with this practice exam covering comprehension, grammar, and vocabulary.',
          duration: 45,
          questions: Array(20).fill(''),
          category: ['English', '11+ Preparation'],
          difficulty: 'medium',
          createdBy: { _id: 'system', username: 'System' },
          isPublic: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: 'mock-exam-3',
          title: 'Verbal Reasoning Test',
          description: 'Challenge your verbal reasoning skills with this comprehensive practice test.',
          duration: 30,
          questions: Array(15).fill(''),
          category: ['Verbal Reasoning', '11+ Preparation'],
          difficulty: 'hard',
          createdBy: { _id: 'system', username: 'System' },
          isPublic: true,
          createdAt: new Date().toISOString()
        }
      ]);
      setUsingMockData(true);
      setError(null);
    } catch (err) {
      logger.error('Failed to create sample exams:', err);
      setError('Failed to create sample exams. Please try again.');
    } finally {
      setCreatingExams(false);
    }
  };

  const handleStartExam = (examId: string) => {
    // Navigate to the exam start page
    navigate(`/exams/start/${examId}`);
  };

  if (loading) return <div className="loading-spinner">Loading exams...</div>;
  if (error) {
    logger.info('Using fallback exam data due to API error');
    return (
      <div className="exams-list-container">
        <h1>Available Exams (Fallback Data)</h1>
        <div className="error-message">{error}</div>
        
        <div className="exams-grid">
          {fallbackExams.map(exam => (
            <div key={exam._id} className="exam-card">
              <div className="exam-header">
                <h2 className="exam-title">{exam.title}</h2>
                <span className={`difficulty-badge ${exam.difficulty}`}>
                  {exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)}
                </span>
              </div>
              
              <p className="exam-description">{exam.description}</p>
              
              <div className="exam-meta">
                <div className="exam-info">
                  <div className="info-item">
                    <span className="info-label">Duration:</span>
                    <span className="info-value">{exam.duration} minutes</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Questions:</span>
                    <span className="info-value">{exam.questions.length}</span>
                  </div>
                </div>
                
                <div className="category-tags">
                  {exam.category.map((cat, index) => (
                    <span key={index} className="category-tag">{cat}</span>
                  ))}
                </div>
              </div>
              
              <div className="exam-footer">
                <span className="created-by">By: {exam.createdBy.username}</span>
                <Link to={`/exams/${exam._id}`} className="start-exam-button">
                  Start Exam
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="create-samples-container">
          <button 
            className="create-samples-button"
            onClick={handleCreateSampleExams}
            disabled={creatingExams}
          >
            {creatingExams ? 'Creating...' : 'Create Sample Exams'}
          </button>
        </div>
      </div>
    );
  }
  if (exams.length === 0) return (
    <div className="exams-list-container">
      <h1>Available Exams</h1>
      
      {usingMockData && (
        <div className="mock-data-indicator">
          <p>⚠️ Using mock exam data. Some features may be limited.</p>
        </div>
      )}
      
      <div className="exams-grid">
        {exams.map(exam => (
          <div key={exam._id} className="exam-card">
            <div className="exam-header">
              <h2 className="exam-title">{exam.title}</h2>
              {exam.difficulty ? (
                <span className={`difficulty-badge ${exam.difficulty}`}>
                  {exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)}
                </span>
              ) : (
                <span className="difficulty-badge medium">Medium</span>
              )}
            </div>
            
            <p className="exam-description">{exam.description}</p>
            
            <div className="exam-meta">
              <div className="exam-info">
                <div className="info-item">
                  <span className="info-label">Duration:</span>
                  <span className="info-value">{exam.duration} minutes</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Questions:</span>
                  <span className="info-value">{exam.questions ? exam.questions.length : '0'}</span>
                </div>
              </div>
              
              <div className="category-tags">
                {exam.category.map((cat, index) => (
                  <span key={index} className="category-tag">{cat}</span>
                ))}
              </div>
            </div>
            
            <div className="exam-footer">
              <span className="created-by">By: {exam.createdBy.username || 'Unknown'}</span>
              <Link to={`/exams/${exam._id}`} className="start-exam-button">
                Start Exam
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="create-samples-container">
        <p>No exams available. Create some sample exams to get started.</p>
        <button 
          className="create-samples-button"
          onClick={handleCreateSampleExams}
          disabled={creatingExams}
        >
          {creatingExams ? 'Creating...' : 'Create Sample Exams'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="exams-list-container">
      <h1>Available Exams</h1>
      
      {usingMockData && (
        <div className="mock-data-indicator">
          <p>⚠️ Using mock exam data. Some features may be limited.</p>
        </div>
      )}
      
      <div className="exams-grid">
        {loading ? (
          <div className="loading-indicator">Loading exams...</div>
        ) : exams.length > 0 ? (
          exams.map(exam => (
            <div key={exam._id} className="exam-card">
              <div className="exam-header">
                <h2 className="exam-title">{exam.title}</h2>
                {exam.difficulty ? (
                  <span className={`difficulty-badge ${exam.difficulty}`}>
                    {exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)}
                  </span>
                ) : (
                  <span className="difficulty-badge medium">Medium</span>
                )}
              </div>
              
              <p className="exam-description">{exam.description}</p>
              
              <div className="exam-meta">
                <div className="exam-info">
                  <div className="info-item">
                    <span className="info-label">Duration:</span>
                    <span className="info-value">{exam.duration} minutes</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Questions:</span>
                    <span className="info-value">{exam.questions ? exam.questions.length : '0'}</span>
                  </div>
                </div>
                
                {exam.category && (
                  <div className="category-tags">
                    {Array.isArray(exam.category) ? (
                      exam.category.map((cat, index) => (
                        <span key={index} className="category-tag">{cat}</span>
                      ))
                    ) : (
                      <span className="category-tag">General</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="exam-footer">
                {exam.createdBy && (
                  <span className="created-by">By: {exam.createdBy.username || 'Unknown'}</span>
                )}
                <button 
                  className="start-exam-button"
                  onClick={() => handleStartExam(exam._id)}
                >
                  Start Exam
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-exams-message">
            <p>No exams available at this time.</p>
            <button 
              className="create-exams-button"
              onClick={handleCreateSampleExams}
              disabled={creatingExams}
            >
              {creatingExams ? 'Creating...' : 'Create Sample Exams'}
            </button>
          </div>
        )}
      </div>
      
      <div className="exams-description">
        <p>Select an exam to start practicing for your 11+ tests</p>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}; 