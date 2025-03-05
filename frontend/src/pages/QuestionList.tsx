import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { questionService } from '../services/api';
import '../styles/QuestionList.css';
import logger from '../utils/logger';

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  _id: string;
  question: string;
  category: string[];
  subCategory?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  options: Option[];
  explanation?: string;
  imageUrl?: string;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

export const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await questionService.getQuestions();
        logger.info('Questions data:', response.data); // Debug log
        setQuestions(response.data);
      } catch (err) {
        logger.error('Failed to fetch questions:', err);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const filteredQuestions = filter === 'all' 
    ? questions 
    : questions.filter(q => q.difficulty === filter);

  if (loading) return <div className="loading-spinner">Loading questions...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="question-list-container">
      <div className="question-list-header">
        <h1>Questions</h1>
        <Link to="/questions/create" className="create-question-button">
          Create Question
        </Link>
      </div>

      <div className="filter-controls">
        <button 
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-button ${filter === 'easy' ? 'active' : ''}`}
          onClick={() => setFilter('easy')}
        >
          Easy
        </button>
        <button 
          className={`filter-button ${filter === 'medium' ? 'active' : ''}`}
          onClick={() => setFilter('medium')}
        >
          Medium
        </button>
        <button 
          className={`filter-button ${filter === 'hard' ? 'active' : ''}`}
          onClick={() => setFilter('hard')}
        >
          Hard
        </button>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="no-questions-message">
          No questions found for the selected filter.
        </div>
      ) : (
        <div className="question-cards">
          {filteredQuestions.map(question => (
            <div key={question._id} className="question-card">
              <div className="question-meta">
                <div className="difficulty-badge-container">
                  {question.difficulty && (
                    <span className={`difficulty-badge ${question.difficulty}`}>
                      {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                    </span>
                  )}
                </div>
                <div className="category-tags">
                  {question.category && question.category.map((cat, index) => (
                    <span key={index} className="category-tag">{cat}</span>
                  ))}
                </div>
              </div>
              
              <h3 className="question-title">{question.question}</h3>
              
              {question.imageUrl && (
                <div className="question-image-thumbnail">
                  <img src={question.imageUrl} alt="Question visual" />
                </div>
              )}
              
              <div className="question-options">
                {question.options && question.options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`option-preview ${option.isCorrect ? 'correct' : ''}`}
                  >
                    {option.text}
                    {option.isCorrect && <span className="correct-mark">✓</span>}
                  </div>
                ))}
              </div>
              
              <div className="question-footer">
                <span className="created-by">
                  By: {question.createdBy?.username || 'Unknown'}
                </span>
                <Link to={`/questions/${question._id}`} className="view-details">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 