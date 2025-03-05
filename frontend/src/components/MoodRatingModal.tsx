import React, { useState } from 'react';
import '../styles/MoodRatingModal.css';

interface MoodRatingModalProps {
  isOpen?: boolean;
  onSkip?: () => void;
  onSubmit: (rating: number) => void;
  onCancel: () => void;
  sessionId?: string;
  examId?: string;
  context?: 'study' | 'exam' | 'practice';
}

export const MoodRatingModal: React.FC<MoodRatingModalProps> = ({
  isOpen = true,
  onSkip,
  onSubmit,
  onCancel,
  sessionId,
  examId,
  context = 'practice'
}) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSubmit = () => {
    if (selectedRating !== null) {
      onSubmit(selectedRating);
    }
  };

  // Emoji mapping for mood ratings
  const moodEmojis = {
    1: '😞', // Frustrated
    2: '😕', // Confused
    3: '😐', // Neutral
    4: '🙂', // Satisfied
    5: '😄'  // Happy
  };

  // Mood descriptions
  const moodDescriptions = {
    1: 'Frustrated',
    2: 'Confused',
    3: 'Neutral',
    4: 'Satisfied',
    5: 'Happy'
  };

  // Context-specific header text
  const getHeaderText = () => {
    switch (context) {
      case 'study':
        return 'How are you feeling about your study session today?';
      case 'exam':
        return 'How are you feeling about this exam?';
      case 'practice':
      default:
        return 'How are you feeling about this practice session?';
    }
  };

  return (
    <div className="mood-rating-modal-overlay">
      <div className="mood-rating-modal">
        <div className="mood-rating-modal-header">
          <h2>{getHeaderText()}</h2>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>
        
        <div className="mood-rating-content">
          <p>Select the emoji that best represents your mood:</p>
          
          <div className="mood-emoji-container">
            {Object.entries(moodEmojis).map(([rating, emoji]) => (
              <div 
                key={rating} 
                className={`mood-emoji-item ${selectedRating === parseInt(rating) ? 'selected' : ''}`}
                onClick={() => handleRatingSelect(parseInt(rating))}
              >
                <div className="emoji">{emoji}</div>
                <div className="mood-description">{moodDescriptions[parseInt(rating) as keyof typeof moodDescriptions]}</div>
              </div>
            ))}
          </div>
          
          {selectedRating && (
            <div className="selected-mood">
              <p>You selected: {moodEmojis[selectedRating as keyof typeof moodEmojis]} {moodDescriptions[selectedRating as keyof typeof moodDescriptions]}</p>
            </div>
          )}
        </div>
        
        <div className="mood-rating-actions">
          {onSkip && (
            <button 
              className="skip-button" 
              onClick={onSkip}
            >
              Skip
            </button>
          )}
          <button 
            className="cancel-button" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="submit-button" 
            onClick={handleSubmit}
            disabled={selectedRating === null}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// Add default export
export default MoodRatingModal; 