import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Practice.css';
import logger from '../utils/logger';

export const Practice: React.FC = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('mixed');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartCustomPractice = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a session ID with the format that our mock data handler recognizes
      const sessionId = `custom-${category}-${Date.now()}`;
      
      // Store practice configuration in localStorage
      localStorage.setItem('practiceConfig', JSON.stringify({
        category,
        difficulty,
        questionCount,
        sessionId
      }));
      
      logger.info('Starting custom practice session:', sessionId);
      
      // Navigate to practice session
      navigate(`/practice/session/${sessionId}`);
    } catch (err) {
      logger.error('Failed to start practice:', err);
      setError('Failed to start practice session. Please try again.');
      setIsLoading(false);
    }
  };

  const handleQuickPractice = (quickCategory: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a session ID with the format that our mock data handler recognizes
      const sessionId = `quick-${quickCategory}-${Date.now()}`;
      
      // Store practice configuration in localStorage
      localStorage.setItem('practiceConfig', JSON.stringify({
        category: quickCategory,
        difficulty: 'medium',
        questionCount: 10,
        sessionId
      }));
      
      logger.info('Starting quick practice session:', sessionId);
      
      // Navigate to practice session
      navigate(`/practice/session/${sessionId}`);
    } catch (err) {
      logger.error('Failed to start quick practice:', err);
      setError('Failed to start practice session. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="practice-container">
      <div className="practice-header">
        <h1>Practice Questions</h1>
        <p>Improve your skills with targeted practice in specific subjects and topics.</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="practice-options">
        <div className="option-card">
          <h2>Custom Practice</h2>
          <div className="option-form">
            <div className="form-group">
              <label htmlFor="category">Subject</label>
              <select 
                id="category" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="mixed">Mixed Subjects</option>
                <option value="mathematics">Mathematics</option>
                <option value="english">English</option>
                <option value="verbal-reasoning">Verbal Reasoning</option>
                <option value="non-verbal-reasoning">Non-Verbal Reasoning</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select 
                id="difficulty" 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="questionCount">Number of Questions</label>
              <select 
                id="questionCount" 
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              >
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
                <option value="15">15 Questions</option>
                <option value="20">20 Questions</option>
              </select>
            </div>
            
            <button 
              className="start-button"
              onClick={handleStartCustomPractice}
              disabled={isLoading}
            >
              {isLoading ? 'Starting...' : 'Start Practice'}
            </button>
          </div>
        </div>
        
        <div className="option-card">
          <h2>Quick Practice</h2>
          <div className="quick-options">
            <button 
              className="quick-option verbal"
              onClick={() => handleQuickPractice('verbal-reasoning')}
              disabled={isLoading}
            >
              <span className="option-title">Verbal Reasoning</span>
              <span className="option-description">10 questions • Medium difficulty</span>
            </button>
            
            <button 
              className="quick-option math"
              onClick={() => handleQuickPractice('mathematics')}
              disabled={isLoading}
            >
              <span className="option-title">Mathematics</span>
              <span className="option-description">10 questions • Medium difficulty</span>
            </button>
            
            <button 
              className="quick-option english"
              onClick={() => handleQuickPractice('english')}
              disabled={isLoading}
            >
              <span className="option-title">English</span>
              <span className="option-description">10 questions • Medium difficulty</span>
            </button>
            
            <button 
              className="quick-option non-verbal"
              onClick={() => handleQuickPractice('non-verbal-reasoning')}
              disabled={isLoading}
            >
              <span className="option-title">Non-Verbal Reasoning</span>
              <span className="option-description">10 questions • Medium difficulty</span>
            </button>
            
            <button 
              className="quick-option mixed"
              onClick={() => handleQuickPractice('mixed')}
              disabled={isLoading}
            >
              <span className="option-title">Mixed Subjects</span>
              <span className="option-description">10 questions • Medium difficulty</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 