import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/YearGroupSelection.css';
import logger from '../utils/logger';

const yearGroups = [
  { value: 2, label: 'Year 2', description: 'Key Stage 1 (age 6-7)' },
  { value: 3, label: 'Year 3', description: 'Key Stage 2 (age 7-8)' },
  { value: 4, label: 'Year 4', description: 'Key Stage 2 (age 8-9)' },
  { value: 5, label: 'Year 5', description: 'Key Stage 2 (age 9-10)' },
  { value: 6, label: 'Year 6', description: 'Key Stage 2 (age 10-11), SATs & 11+ exams' },
  { value: 7, label: 'Year 7', description: 'Key Stage 3 (age 11-12)' },
  { value: 8, label: 'Year 8', description: 'Key Stage 3 (age 12-13)' },
  { value: 9, label: 'Year 9', description: 'Key Stage 3 (age 13-14), GCSE preparation' },
  { value: 10, label: 'Year 10', description: 'Key Stage 4 (age 14-15), GCSE' },
  { value: 11, label: 'Year 11', description: 'Key Stage 4 (age 15-16), GCSE' },
  { value: 12, label: 'Year 12', description: 'A-Levels / Sixth Form (age 16-17)' },
  { value: 13, label: 'Year 13', description: 'A-Levels / Sixth Form (age 17-18), University Admissions' }
];

const YearGroupSelection: React.FC = () => {
  const [selectedYearGroup, setSelectedYearGroup] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { updateYearGroup, currentUser } = useAuth();

  const handleYearGroupSelection = async () => {
    if (!selectedYearGroup) {
      setError('Please select a year group');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Update the user's year group in the database/storage
      await updateYearGroup(selectedYearGroup);
      
      // Redirect to the dashboard with the new user information
      navigate('/dashboard');
    } catch (err: any) {
      setError('Failed to set year group. Please try again.');
      logger.error('Year group selection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="year-group-container">
      <h1>Select Your Year Group</h1>
      <p>Help us personalize your learning experience by selecting your current year group:</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="year-group-grid">
        {yearGroups.map(yearGroup => (
          <div 
            key={yearGroup.value}
            className={`year-group-card ${selectedYearGroup === yearGroup.value ? 'selected' : ''}`}
            onClick={() => setSelectedYearGroup(yearGroup.value)}
          >
            <h3>{yearGroup.label}</h3>
            <p>{yearGroup.description}</p>
          </div>
        ))}
      </div>
      
      <div className="buttons-container">
        <button 
          className="continue-button"
          onClick={handleYearGroupSelection}
          disabled={isLoading || !selectedYearGroup}
        >
          {isLoading ? 'Processing...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default YearGroupSelection; 