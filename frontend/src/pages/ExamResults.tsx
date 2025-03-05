import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import MoodRatingService from '../components/MoodRatingService';
import '../styles/ExamResults.css';
import logger from '../utils/logger';

export const ExamResults: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scoreCircleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setLoading(true);
      
      // Get results from localStorage
      const storedResults = localStorage.getItem('examResults');
      if (storedResults) {
        setResults(JSON.parse(storedResults));
      } else {
        throw new Error('Results not found');
      }
    } catch (err) {
      logger.error('Failed to load results:', err);
      setError('Failed to load exam results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  // Update the score circle when results are loaded
  useEffect(() => {
    if (results && scoreCircleRef.current) {
      scoreCircleRef.current.style.setProperty('--percentage', `${results.percentage}%`);
    }
  }, [results]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  };

  if (loading) return <div className="loading-spinner">Loading results...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!results) return <div className="error-message">Results not found.</div>;

  return (
    <div className="exam-results-container">
      <MoodRatingService examId={attemptId} event="EXAM_COMPLETED" />
      
      <div className="results-header">
        <h1>Exam Results</h1>
        <h2>{results.title}</h2>
      </div>
      
      <div className="results-summary-card">
        <div className="score-section">
          <div className="score-circle" ref={scoreCircleRef}>
            <div className="score-percentage">{results.percentage}%</div>
          </div>
          <div className="score-details">
            <div className="score-item">
              <span className="score-label">Correct Answers:</span>
              <span className="score-value">{results.score} of {results.totalQuestions}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Time Spent:</span>
              <span className="score-value">{formatTime(results.timeSpent)}</span>
            </div>
          </div>
        </div>
        
        <div className="action-buttons">
          <Link to="/exams" className="back-to-exams-button">Back to Exams</Link>
          <Link to="/dashboard" className="dashboard-button">Go to Dashboard</Link>
        </div>
      </div>
      
      <div className="questions-review-section">
        <h2>Questions Review</h2>
        
        <div className="questions-list">
          {results.answers.map((answer: any, index: number) => (
            <div key={index} className={`question-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="question-header">
                <div className="question-number">Question {index + 1}</div>
                <div className={`question-status ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                  {answer.isCorrect ? 'Correct' : 'Incorrect'}
                </div>
              </div>
              
              <div className="question-text">{answer.question}</div>
              
              <div className="question-answers">
                <div className="answer-item">
                  <span className="answer-label">Your Answer:</span>
                  <span className={`answer-value ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                    {answer.selectedOption || 'No answer provided'}
                  </span>
                </div>
                
                {!answer.isCorrect && (
                  <div className="answer-item">
                    <span className="answer-label">Correct Answer:</span>
                    <span className="answer-value correct">{answer.correctOption}</span>
                  </div>
                )}
                
                {answer.explanation && (
                  <div className="answer-explanation">
                    <span className="explanation-label">Explanation:</span>
                    <p>{answer.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 