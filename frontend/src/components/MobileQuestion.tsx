import React, { useState, useRef, useEffect } from 'react';
import useSwipe from '../hooks/useSwipe';
import { isMobileDevice } from '../utils/mobileDetection';
import logger from '../utils/logger';

interface QuestionProps {
  question: {
    id?: string;
    title: string;
    content: string;
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    explanation?: string;
  };
  onSubmit: (answer: string, timeSpent: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showExplanation?: boolean;
}

const MobileQuestion: React.FC<QuestionProps> = ({ 
  question, 
  onSubmit, 
  onNext, 
  onPrevious,
  showExplanation = false
}) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [startTime] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [touchEnabled, setTouchEnabled] = useState(true);
  const [swipeDisabled, setSwipeDisabled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle swipe gestures for navigation with error handling
  const { ref } = useSwipe({
    onSwipeLeft: () => {
      if (onNext && submitted && touchEnabled) {
        onNext();
      }
    },
    onSwipeRight: () => {
      if (onPrevious && touchEnabled) {
        onPrevious();
      }
    }
  }, { 
    threshold: 70, 
    preventDefault: false, // Don't prevent default to allow normal scrolling
    passive: true, // Use passive touch listeners for better performance
    minSwipeDistance: 50, // Require more distinct swipes
    disabled: swipeDisabled || !touchEnabled // Disable swipe when needed
  });
  
  // Set the ref from useSwipe to our container
  useEffect(() => {
    if (containerRef.current) {
      try {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = containerRef.current;
      } catch (error) {
        logger.error('Error setting swipe ref:', error);
        setTouchEnabled(false);
      }
    }
    
    // Ensure options are available
    if (!question || !question.options || !Array.isArray(question.options) || question.options.length === 0) {
      logger.error('Invalid question options:', question);
    }
    
    // When component mounts, briefly disable swipe to prevent accidental swipes during loading
    setSwipeDisabled(true);
    const enableTimer = setTimeout(() => {
      setSwipeDisabled(false);
    }, 1000);
    
    return () => {
      // Cleanup
      clearTimeout(enableTimer);
      setTouchEnabled(false);
      setSwipeDisabled(true);
    };
  }, [ref, question]);

  const handleOptionSelect = (optionText: string) => {
    if (!submitted) {
      setSelectedOption(optionText);
    }
  };

  const handleSubmit = () => {
    if (!selectedOption || submitted) return;
    
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      onSubmit(selectedOption, timeSpent);
      setSubmitted(true);
      
      // Check if the selected option is correct
      const correctOption = question.options.find(option => option.isCorrect);
      setIsCorrect(correctOption?.text === selectedOption);
      
      // After submitting, briefly disable swipe to prevent accidental navigation
      setSwipeDisabled(true);
      setTimeout(() => {
        setSwipeDisabled(false);
      }, 500);
    } catch (error) {
      logger.error('Error submitting answer:', error);
    }
  };

  const getOptionClass = (option: { text: string; isCorrect: boolean }) => {
    if (!submitted) return '';
    
    try {
      if (option.text === selectedOption) {
        return option.isCorrect ? 'correct-option' : 'incorrect-option';
      }
      
      return option.isCorrect ? 'correct-option' : '';
    } catch (error) {
      logger.error('Error getting option class:', error);
      return '';
    }
  };

  // Handle case where question data is invalid
  if (!question || !question.options || !Array.isArray(question.options)) {
    return (
      <div className="mobile-question-container">
        <div className="mobile-question-error">
          <h3>Question data error</h3>
          <p>There was a problem loading this question. Please try again later.</p>
          {onPrevious && (
            <button 
              className="mobile-prev-button" 
              style={{ marginTop: '20px' }}
              onClick={onPrevious}
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-question-container" ref={containerRef}>
      <div className="mobile-question-header">
        <h2 className="mobile-question-title">{question.title}</h2>
      </div>
      
      <div className="mobile-question-content">
        <p>{question.content}</p>
      </div>
      
      <div className="mobile-question-options">
        {question.options.map((option, index) => (
          <div 
            key={index}
            className={`mobile-question-option ${selectedOption === option.text ? 'selected' : ''} ${getOptionClass(option)}`}
            onClick={() => handleOptionSelect(option.text)}
          >
            <div className="option-indicator">{String.fromCharCode(65 + index)}</div>
            <div className="option-text">{option.text}</div>
            {submitted && option.isCorrect && (
              <div className="option-correct-indicator">✓</div>
            )}
          </div>
        ))}
      </div>
      
      {submitted && showExplanation && question.explanation && (
        <div className="mobile-question-explanation">
          <h3>Explanation</h3>
          <p>{question.explanation}</p>
        </div>
      )}
      
      <div className="mobile-question-actions">
        {!submitted ? (
          <button 
            className="mobile-submit-button"
            onClick={handleSubmit}
            disabled={!selectedOption}
          >
            Submit Answer
          </button>
        ) : (
          <div className="mobile-navigation-buttons">
            {onPrevious && (
              <button 
                className="mobile-prev-button"
                onClick={onPrevious}
              >
                Previous
              </button>
            )}
            {onNext && (
              <button 
                className="mobile-next-button"
                onClick={onNext}
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
      
      {isMobileDevice() && touchEnabled && !swipeDisabled && submitted && (
        <div className="mobile-swipe-hint">
          Swipe to navigate between questions
        </div>
      )}
    </div>
  );
};

export default MobileQuestion; 