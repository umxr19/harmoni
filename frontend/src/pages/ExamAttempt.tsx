import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ExamAttempt.css';
import logger from '../utils/logger';

// Generate mock questions
const generateMockQuestions = (count: number, category: string = 'General') => {
  return Array(count).fill(null).map((_, index) => ({
    id: `q-${index + 1}`,
    question: `This is a sample ${category} question ${index + 1}. What is the correct answer?`,
    options: [
      `Option A for question ${index + 1}`,
      `Option B for question ${index + 1}`,
      `Option C for question ${index + 1}`,
      `Option D for question ${index + 1}`
    ],
    correctAnswer: 0, // Index of correct option (for scoring)
    explanation: `This is the explanation for question ${index + 1}.`
  }));
};

export const ExamAttempt: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  
  // Get exam data from localStorage
  const storedExam = localStorage.getItem('currentExam');
  const examData = storedExam ? JSON.parse(storedExam) : {
    examId: 'mock-exam',
    title: 'Mock Exam',
    duration: 60,
    questionCount: 10,
    difficulty: 'medium'
  };
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(examData.duration * 60); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate mock questions when component mounts
  useEffect(() => {
    try {
      setLoading(true);
      
      // Generate mock questions based on exam data
      const mockQuestions = generateMockQuestions(examData.questionCount);
      setQuestions(mockQuestions);
      
      // Initialize selected answers array
      setSelectedAnswers(Array(mockQuestions.length).fill(null));
    } catch (err) {
      logger.error('Failed to load questions:', err);
      setError('Failed to load exam questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [examData.questionCount]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = async () => {
    try {
      setIsSubmitting(true);
      
      // Calculate score based on correct answers
      const score = questions.reduce((total, question, index) => {
        return total + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
      }, 0);
      
      // Calculate percentage
      const percentage = Math.round((score / questions.length) * 100);
      
      // Store results in localStorage
      localStorage.setItem('examResults', JSON.stringify({
        examId: examData.examId,
        title: examData.title,
        score,
        totalQuestions: questions.length,
        percentage,
        timeSpent: (examData.duration * 60) - timeRemaining,
        answers: selectedAnswers.map((answer, index) => ({
          questionId: questions[index].id,
          question: questions[index].question,
          selectedOption: answer !== null ? questions[index].options[answer] : null,
          correctOption: questions[index].options[questions[index].correctAnswer],
          isCorrect: answer === questions[index].correctAnswer,
          explanation: questions[index].explanation
        }))
      }));
      
      // Navigate to results page
      navigate(`/exams/results/${attemptId}`);
    } catch (err) {
      logger.error('Failed to submit exam:', err);
      setError('Failed to submit exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading exam questions...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (questions.length === 0) return <div className="error-message">No questions found for this exam.</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="exam-attempt-container">
      <div className="exam-attempt-header">
        <h1>{examData.title}</h1>
        <div className="exam-meta">
          <div className="timer">Time Remaining: {formatTime(timeRemaining)}</div>
          <div className="question-counter">Question {currentQuestionIndex + 1} of {questions.length}</div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      
      <div className="question-container">
        <div className="question-text">
          <h2>{currentQuestion.question}</h2>
        </div>
        
        <div className="options-container">
          {currentQuestion.options.map((option: string, index: number) => (
            <div 
              key={index}
              className={`option ${selectedAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(index)}
            >
              <div className="option-letter">{String.fromCharCode(65 + index)}</div>
              <div className="option-text">{option}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="navigation-buttons">
        <button 
          className="nav-button previous"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </button>
        
        {currentQuestionIndex < questions.length - 1 ? (
          <button 
            className="nav-button next"
            onClick={handleNextQuestion}
          >
            Next
          </button>
        ) : (
          <button 
            className="nav-button submit"
            onClick={handleSubmitExam}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        )}
      </div>
      
      <div className="question-navigation">
        {questions.map((_, index) => (
          <div 
            key={index}
            className={`question-dot ${index === currentQuestionIndex ? 'current' : ''} ${selectedAnswers[index] !== null ? 'answered' : ''}`}
            onClick={() => setCurrentQuestionIndex(index)}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}; 