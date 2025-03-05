import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { questionService } from '../services/api';
import '../styles/QuestionDetail.css';
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
  difficulty: 'easy' | 'medium' | 'hard';
  options: Option[];
  explanation?: string;
  imageUrl?: string;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface QuestionStats {
  totalAttempts: number;
  correctAttempts: number;
  averageTime: number;
  successRate: number;
}

export const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionAndStats = async () => {
      try {
        setLoading(true);
        const [questionRes, statsRes] = await Promise.all([
          questionService.getQuestion(id || ''),
          questionService.getQuestionStats(id || '')
        ]);
        
        setQuestion(questionRes.data as Question);
        setStats(statsRes.data as QuestionStats);
      } catch (err) {
        logger.error('Failed to fetch question details:', err);
        setError('Failed to load question details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionAndStats();
  }, [id]);

  if (loading) return <div className="loading-spinner">Loading question details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!question) return <div>Question not found.</div>;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="question-detail-container">
      <div className="question-header">
        <h1>Question Details</h1>
        <Link to="/questions" className="back-link">Back to Questions</Link>
      </div>
      
      <div className="question-meta">
        <div className="meta-item">
          <span className="meta-label">Difficulty:</span>
          <span className={`difficulty-badge ${question.difficulty}`}>
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </span>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Categories:</span>
          <div className="category-tags">
            {question.category.map((cat, index) => (
              <span key={index} className="category-tag">{cat}</span>
            ))}
          </div>
        </div>
        
        {question.subCategory && (
          <div className="meta-item">
            <span className="meta-label">Sub-category:</span>
            <span>{question.subCategory}</span>
          </div>
        )}
        
        <div className="meta-item">
          <span className="meta-label">Created by:</span>
          <span>{question.createdBy.username}</span>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Created on:</span>
          <span>{formatDate(question.createdAt)}</span>
        </div>
      </div>
      
      <div className="question-content">
        <h2>Question</h2>
        <p>{question.question}</p>
        
        {question.imageUrl && (
          <div className="question-image">
            <img src={question.imageUrl} alt="Question visual" />
          </div>
        )}
      </div>
      
      <div className="options-section">
        <h2>Answer Options</h2>
        <div className="options-list">
          {question.options.map((option, index) => (
            <div 
              key={index} 
              className={`option-item ${option.isCorrect ? 'correct' : ''}`}
            >
              <span className="option-text">{option.text}</span>
              {option.isCorrect && <span className="correct-indicator">✓ Correct Answer</span>}
            </div>
          ))}
        </div>
      </div>
      
      {question.explanation && (
        <div className="explanation-section">
          <h2>Explanation</h2>
          <p>{question.explanation}</p>
        </div>
      )}
      
      {stats && (
        <div className="stats-section">
          <h2>Question Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalAttempts}</div>
              <div className="stat-label">Total Attempts</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{stats.successRate.toFixed(1)}%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{formatTime(stats.averageTime)}</div>
              <div className="stat-label">Average Time</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 