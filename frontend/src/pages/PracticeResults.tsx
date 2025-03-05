import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import MoodRatingService from '../components/MoodRatingService';
import '../styles/PracticeResults.css';
import logger from '../utils/logger';

export const PracticeResults: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scoreCircleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // Get results from localStorage
        const storedResults = localStorage.getItem('practiceResults');
        if (storedResults) {
          setResults(JSON.parse(storedResults));
        } else {
          // Generate mock results if none exist
          const mockResults = {
            sessionId,
            totalQuestions: 10,
            correctAnswers: Math.floor(Math.random() * 8) + 3, // 3-10 correct answers
            score: 0,
            timeSpent: Math.floor(Math.random() * 600) + 300, // 5-15 minutes
            category: 'Mixed',
            difficulty: 'Medium',
            questions: Array(10).fill(null).map((_, i) => ({
              id: `q${i+1}`,
              text: `Mock question ${i+1}`,
              userAnswer: Math.random() > 0.3 ? 'Correct option' : 'Wrong option',
              correctAnswer: 'Correct option',
              isCorrect: Math.random() > 0.3
            })),
            completedAt: new Date().toISOString()
          };
          
          // Calculate score
          mockResults.score = Math.round((mockResults.correctAnswers / mockResults.totalQuestions) * 100);
          
          setResults(mockResults);
        }
      } catch (err) {
        logger.error('Failed to fetch practice results:', err);
        setError('Failed to load practice results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [sessionId]);

  // Update the score circle when results are loaded
  useEffect(() => {
    if (results && scoreCircleRef.current) {
      scoreCircleRef.current.style.setProperty('--percentage', `${results.score}%`);
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
    <div className="practice-results-container">
      <MoodRatingService sessionId={sessionId} event="PRACTICE_COMPLETED" />
      
      <div className="results-header">
        <h1>Practice Results</h1>
        <h2>{results.category} - {results.difficulty}</h2>
      </div>
      
      <div className="results-summary-card">
        <div className="score-section">
          <div className="score-circle" ref={scoreCircleRef}>
            <div className="score-percentage">{results.score}%</div>
          </div>
          <div className="score-details">
            <div className="score-item">
              <span className="score-label">Correct Answers:</span>
              <span className="score-value">{results.correctAnswers} of {results.totalQuestions}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Time Spent:</span>
              <span className="score-value">{formatTime(results.timeSpent)}</span>
            </div>
          </div>
        </div>
        
        <div className="action-buttons">
          <Link to="/practice" className="practice-again-button">Practice Again</Link>
          <Link to="/dashboard" className="dashboard-button">Go to Dashboard</Link>
        </div>
      </div>
      
      <div className="questions-review-section">
        <h2>Questions Review</h2>
        
        <div className="questions-list">
          {results.questions.map((question: any, index: number) => (
            <div key={index} className={`question-item ${question.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="question-header">
                <div className="question-number">Question {index + 1}</div>
                <div className={`question-status ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                  {question.isCorrect ? 'Correct' : 'Incorrect'}
                </div>
              </div>
              
              <div className="question-text">{question.text}</div>
              
              <div className="question-answers">
                <div className="answer-item">
                  <span className="answer-label">Your Answer:</span>
                  <span className={`answer-value ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                    {question.userAnswer || 'No answer provided'}
                  </span>
                </div>
                
                {!question.isCorrect && (
                  <div className="answer-item">
                    <span className="answer-label">Correct Answer:</span>
                    <span className="answer-value correct">{question.correctAnswer}</span>
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