import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MoodRatingModal from './MoodRatingModal';
import { wellbeingService } from '../services/api';
import logger from '../utils/logger';

// Events that should trigger a mood rating prompt
const TRIGGER_EVENTS = [
  'EXAM_COMPLETED',
  'PRACTICE_COMPLETED',
  'SESSION_ENDED'
];

interface MoodRatingServiceProps {
  sessionId?: string;
  examId?: string;
  event?: string;
}

const MoodRatingService: React.FC<MoodRatingServiceProps> = ({ 
  sessionId, 
  examId, 
  event 
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    // Check if we should show the modal based on the event or URL
    const shouldShowModal = () => {
      // If an event is provided and it's in our trigger list
      if (event && TRIGGER_EVENTS.includes(event)) {
        return true;
      }

      // Check URL patterns that should trigger the modal
      const path = location.pathname;
      if (
        path.includes('/exams/results/') || 
        path.includes('/practice/results/')
      ) {
        return true;
      }

      return false;
    };

    // Show modal with a slight delay for better UX
    if (shouldShowModal()) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [event, location.pathname]);

  const handleSubmit = async (rating: number) => {
    try {
      await wellbeingService.submitMoodRating({
        rating,
        sessionId,
        examId
      });
      setShowModal(false);
    } catch (error) {
      logger.error('Failed to submit mood rating:', error);
      setShowModal(false);
    }
  };

  const handleSkip = () => {
    setShowModal(false);
  };

  return (
    <>
      {showModal && (
        <MoodRatingModal
          isOpen={showModal}
          onSubmit={handleSubmit}
          onSkip={handleSkip}
          sessionId={sessionId}
          examId={examId}
        />
      )}
    </>
  );
};

export default MoodRatingService; 