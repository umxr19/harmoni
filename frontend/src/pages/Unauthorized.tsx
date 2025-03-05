import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Unauthorized.css';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
        <button 
          className="home-button"
          onClick={() => navigate('/')}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}; 