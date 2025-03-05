import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { questionService } from '../services/api';
import '../styles/PracticeSets.css';
import logger from '../utils/logger';

interface PracticeSet {
  _id: string;
  name: string;
  description: string;
  category: string[];
  difficulty: string;
  createdBy: {
    _id: string;
    username: string;
  };
  isPublic: boolean;
  createdAt: string;
}

export const PracticeSets: React.FC = () => {
  const [practiceSets, setPracticeSets] = useState<PracticeSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPracticeSets = async () => {
      try {
        setLoading(true);
        const response = await questionService.getPracticeSets();
        setPracticeSets(response.data);
      } catch (err) {
        logger.error('Failed to fetch practice sets:', err);
        setError('Failed to load practice sets. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPracticeSets();
  }, []);

  const filteredSets = filter === 'all' 
    ? practiceSets 
    : practiceSets.filter(set => set.difficulty === filter);

  if (loading) return <div className="loading-spinner">Loading practice sets...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="practice-sets-container">
      <div className="practice-sets-header">
        <h1>Practice Sets</h1>
        <div className="quick-actions">
          <Link to="/practice/random" className="random-practice-button">
            Random Practice
          </Link>
        </div>
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

      {filteredSets.length === 0 ? (
        <div className="no-sets-message">
          No practice sets found for the selected filter.
        </div>
      ) : (
        <div className="practice-sets-grid">
          {filteredSets.map(set => (
            <div key={set._id} className="practice-set-card">
              <h2>{set.name}</h2>
              <p className="set-description">{set.description}</p>
              
              <div className="set-details">
                <div className="set-detail">
                  <span className="detail-label">Difficulty:</span>
                  <span className={`difficulty-badge ${set.difficulty}`}>
                    {set.difficulty.charAt(0).toUpperCase() + set.difficulty.slice(1)}
                  </span>
                </div>
                
                <div className="set-detail">
                  <span className="detail-label">Categories:</span>
                  <span className="categories-list">
                    {set.category.join(', ')}
                  </span>
                </div>
                
                <div className="set-detail">
                  <span className="detail-label">Created by:</span>
                  <span>{set.createdBy.username}</span>
                </div>
              </div>
              
              <Link to={`/practice/${set._id}`} className="start-practice-button">
                Start Practice
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 