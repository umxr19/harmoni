import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { onboardingService } from '../services/api';
import { Subject } from '../types';
import '../styles/SubjectPage.css';
import logger from '../utils/logger';

const SubjectPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { currentUser } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentUser?.yearGroup && subjectId) {
      fetchSubject();
    }
  }, [subjectId, currentUser]);
  
  const fetchSubject = async () => {
    if (!currentUser?.yearGroup || !subjectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all subjects for the user's year group
      const response = await onboardingService.getSubjectsForYearGroup(currentUser.yearGroup);
      
      if (response && response.subjects) {
        // Find the specific subject by ID
        const foundSubject = response.subjects.find((s: Subject) => s.id === subjectId);
        
        if (foundSubject) {
          setSubject(foundSubject);
        } else {
          setError('Subject not found for your year group');
        }
      } else {
        setError('Unable to load subjects');
      }
    } catch (err) {
      logger.error('Error fetching subject:', err);
      setError('Unable to load subject. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const getHeaderStyle = () => {
    if (subject?.color) {
      return {
        background: `linear-gradient(135deg, ${subject.color}, ${adjustColor(subject.color, -20)})`,
      };
    }
    
    // Default gradient
    return {
      background: 'linear-gradient(135deg, #6b46c1, #4834ba)',
    };
  };
  
  // Function to adjust color brightness
  const adjustColor = (color: string, amount: number) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => {
      let result = Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16);
      return result.length === 1 ? '0' + result : result;
    });
  };
  
  const getSubjectLevel = () => {
    if (!subject) return null;
    if (subject.isALevel) return 'A-Level';
    if (subject.isGCSE) return 'GCSE';
    if (subject.is11Plus) return '11+ Exam';
    return 'Key Stage';
  };
  
  if (loading) {
    return <div className="subject-page-loading">Loading subject...</div>;
  }
  
  if (error || !subject) {
    return (
      <div className="subject-page-error">
        <h2>Error Loading Subject</h2>
        <p>{error || 'Subject not found'}</p>
        <Link to="/" className="back-button">Back to Home</Link>
      </div>
    );
  }
  
  return (
    <div className="subject-page">
      <div className="subject-header" style={getHeaderStyle()}>
        <div className="container">
          <h1>{subject.name}</h1>
          <div className="subject-meta">
            {getSubjectLevel() && (
              <span className="subject-level">{getSubjectLevel()}</span>
            )}
            {currentUser?.yearGroup && (
              <span className="subject-year">Year {currentUser.yearGroup}</span>
            )}
          </div>
          <p className="subject-description">{subject.description}</p>
        </div>
      </div>
      
      <div className="subject-content container">
        <div className="nav-buttons">
          <Link to="/" className="back-button">
            &larr; Back to Subjects
          </Link>
        </div>
        
        <h2>Study Options</h2>
        <div className="subject-activities">
          <Link to={`/practice?subject=${subject.id}`} className="activity-card">
            <div className="activity-icon">📝</div>
            <div className="activity-content">
              <h3>Practice Questions</h3>
              <p>Access targeted practice questions specific to {subject.name}</p>
            </div>
          </Link>
          
          <Link to={`/exams?subject=${subject.id}`} className="activity-card">
            <div className="activity-icon">🎯</div>
            <div className="activity-content">
              <h3>Take an Exam</h3>
              <p>Test your knowledge with a full {subject.name} exam</p>
            </div>
          </Link>
          
          <Link to={`/study-materials?subject=${subject.id}`} className="activity-card">
            <div className="activity-icon">📚</div>
            <div className="activity-content">
              <h3>Study Materials</h3>
              <p>Access revision notes and learning resources</p>
            </div>
          </Link>
        </div>
        
        <h2>Topics Covered</h2>
        {subject.categories && subject.categories.length > 0 ? (
          <div className="subject-topics">
            {subject.categories.map((category, index) => (
              <div key={index} className="topic-card">
                <h3>{category}</h3>
                <Link to={`/practice?subject=${subject.id}&category=${category}`} className="topic-practice-button">
                  Practice Now
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-topics">No specific topics found for this subject.</p>
        )}
      </div>
    </div>
  );
};

export default SubjectPage; 