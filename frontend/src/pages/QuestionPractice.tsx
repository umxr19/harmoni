import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { questionService } from '../services/api';
import '../styles/QuestionPractice.css';
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
}

export const QuestionPractice: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        let response;
        
        if (setId === 'random') {
          response = await questionService.getRandomPractice();
        } else {
          response = await questionService.getPracticeSet(setId || '');
        }
        
        if (response && response.data) {
          setQuestions(response.data as Question[]);
        } else {
          // Handle empty response
          setError('No questions available. Please try a different practice set.');
        }
      } catch (err) {
        logger.error('Failed to fetch questions:', err);
        setError('Failed to load questions. Please try again or select a different practice set.');
        
        // Provide mock data as fallback
        setQuestions([
          {
            _id: 'mock1',
            question: 'What is 7 × 8?',
            category: ['Mathematics'],
            difficulty: 'easy',
            options: [
              { text: '54', isCorrect: false },
              { text: '56', isCorrect: true },
              { text: '58', isCorrect: false },
              { text: '62', isCorrect: false }
            ],
            explanation: '7 × 8 = 56'
          },
          {
            _id: 'mock2',
            question: 'Which word is a synonym for "happy"?',
            category: ['English'],
            difficulty: 'easy',
            options: [
              { text: 'Sad', isCorrect: false },
              { text: 'Angry', isCorrect: false },
              { text: 'Joyful', isCorrect: true },
              { text: 'Tired', isCorrect: false }
            ],
            explanation: 'Joyful means feeling or expressing great pleasure and happiness.'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [setId]);

  useEffect(() => {
    // Start timer when questions are loaded
    if (questions.length > 0 && !isAnswered) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    // Clear timer when component unmounts or when answered
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [questions, currentIndex, isAnswered]);

  const handleOptionSelect = async (optionText: string) => {
    if (isAnswered) return;
    
    setSelectedOption(optionText);
    setIsAnswered(true);
    setShowExplanation(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Submit the attempt
    try {
      await questionService.submitAttempt(
        questions[currentIndex]._id,
        optionText,
        timer
      );
    } catch (err) {
      logger.error('Failed to submit attempt:', err);
    }
  };

  const moveToNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowExplanation(false);
      setTimer(0);
    } else {
      // If this is the last question, navigate to results
      if (setId && setId !== 'random') {
        navigate(`/practice/results/${setId}`);
      } else {
        // For random practice, just show completion
        setCurrentIndex(currentIndex + 1); // This will trigger the completion message
      }
    }
  };

  const moveToPreviousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Previous questions are considered already answered
      setIsAnswered(true);
      setShowExplanation(true);
      // You might want to fetch the previous answer here
    }
  };

  const renderCompletionMessage = () => {
    return (
      <div className="completion-message">
        <h2>Practice Completed!</h2>
        <p>You have completed all the questions in this practice set.</p>
        
        <div className="completion-actions">
          <Link to="/" className="home-button">
            Return to Home
          </Link>
          
          <Link to="/practice/sets" className="browse-button">
            Browse More Practice Sets
          </Link>
          
          {setId && setId !== 'random' && (
            <Link to={`/practice/results/${setId}`} className="results-button">
              View Results
            </Link>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-spinner">Loading questions...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (questions.length === 0) {
    return (
      <div className="question-practice-container">
        <div className="no-questions-message">
          <h2>No Questions Available</h2>
          <p>There are no questions available for this practice set.</p>
          <Link to="/practice/sets" className="browse-button">
            Browse Practice Sets
          </Link>
        </div>
      </div>
    );
  }

  if (isAnswered && currentIndex === questions.length - 1) {
    return (
      <div className="question-practice-container">
        {renderCompletionMessage()}
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isCorrectAnswer = selectedOption && 
    currentQuestion.options.find(opt => opt.text === selectedOption)?.isCorrect;

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="question-practice-container">
      <div className="question-header">
        <div className="progress-indicator">
          Question {currentIndex + 1} of {questions.length}
        </div>
        <div className="timer">{formatTime(timer)}</div>
      </div>
      
      <div className="question-meta">
        <div className="difficulty-indicator">
          <span className={`difficulty-badge ${currentQuestion.difficulty}`}>
            {currentQuestion.difficulty?.charAt(0).toUpperCase() + (currentQuestion.difficulty?.slice(1) || '')}
          </span>
        </div>
        <div className="category-tags">
          {currentQuestion.category.map((cat, index) => (
            <span key={index} className="category-tag">{cat}</span>
          ))}
        </div>
      </div>

      <div className="question-content">
        <h2>Question</h2>
        <p>{currentQuestion.question}</p>
        
        {currentQuestion.imageUrl && (
          <div className="question-image">
            <img src={currentQuestion.imageUrl} alt="Question visual" />
          </div>
        )}
      </div>
      
      <div className="options-container">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${
              isAnswered
                ? option.isCorrect
                  ? 'correct'
                  : selectedOption === option.text
                  ? 'incorrect'
                  : ''
                : ''
            }`}
            onClick={() => handleOptionSelect(option.text)}
            disabled={isAnswered}
          >
            {option.text}
          </button>
        ))}
      </div>
      
      {showExplanation && currentQuestion.explanation && (
        <div className="explanation-panel">
          <h3>Explanation</h3>
          <p>{currentQuestion.explanation}</p>
        </div>
      )}
      
      <div className="navigation-controls">
        <button 
          className="nav-button" 
          onClick={moveToPreviousQuestion}
          disabled={currentIndex === 0}
        >
          Previous
        </button>
        
        {isAnswered && (
          <button 
            className="nav-button next" 
            onClick={moveToNextQuestion}
          >
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}; 