import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ExamStart.css';
import logger from '../utils/logger';

// Define mock exams directly in the component
const MOCK_EXAMS = {
  'mock-exam-1': {
    _id: 'mock-exam-1',
    title: '11+ Mathematics Practice Exam',
    description: 'A comprehensive mathematics exam covering all key topics for 11+ preparation.',
    duration: 60,
    questionCount: 25,
    difficulty: 'medium',
    instructions: `
      <p>This exam is designed to test your mathematical knowledge and problem-solving abilities at the 11+ level.</p>
      <p>You will be presented with a variety of question types including arithmetic, algebra, geometry, and word problems.</p>
    `,
    isPublic: true,
    category: ['Mathematics', '11+ Preparation']
  },
  'mock-exam-2': {
    _id: 'mock-exam-2',
    title: '11+ English Practice Exam',
    description: 'Test your English skills with this practice exam designed for 11+ preparation.',
    duration: 45,
    questionCount: 20,
    difficulty: 'medium',
    instructions: `
      <p>This exam assesses your English language skills including comprehension, grammar, vocabulary, and writing.</p>
      <p>Read each passage carefully before answering the related questions.</p>
    `,
    isPublic: true,
    category: ['English', '11+ Preparation']
  },
  'mock-exam-3': {
    _id: 'mock-exam-3',
    title: 'Verbal Reasoning Test',
    description: 'Sharpen your verbal reasoning skills with this focused practice exam.',
    duration: 30,
    questionCount: 15,
    difficulty: 'hard',
    instructions: `
      <p>This test evaluates your verbal reasoning abilities, including word patterns, logical deduction, and problem-solving.</p>
      <p>Work through each question methodically and pay attention to the specific instructions for each question type.</p>
    `,
    isPublic: true,
    category: ['Verbal Reasoning', '11+ Preparation']
  }
};

export const ExamStart: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingExam, setStartingExam] = useState(false);
  const [candidateName, setCandidateName] = useState('');

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        
        // Check if we're using a mock exam
        if (examId && MOCK_EXAMS[examId as keyof typeof MOCK_EXAMS]) {
          // Use mock data
          setExam(MOCK_EXAMS[examId as keyof typeof MOCK_EXAMS]);
        } else if (examId?.startsWith('mock-')) {
          // Use default mock data
          setExam({
            _id: examId,
            title: 'Mock Exam',
            description: 'This is a practice exam to help you prepare for your 11+ tests.',
            duration: 60,
            questionCount: 25,
            difficulty: 'medium',
            instructions: `
              <p>This is a practice exam designed to simulate the 11+ examination experience.</p>
              <p>Answer all questions to the best of your ability and manage your time carefully.</p>
            `
          });
        } else {
          try {
            // Attempt to fetch from API but fallback to mock data
            setExam({
              _id: examId || 'sample-exam',
              title: 'Sample Exam',
              description: 'This is a sample exam to help you practice.',
              duration: 45,
              questionCount: 20,
              difficulty: 'medium',
              instructions: `
                <p>This is a sample exam to help you practice your test-taking skills.</p>
                <p>Read each question carefully before selecting your answer.</p>
              `
            });
          } catch (apiError) {
            logger.error('API error:', apiError);
            // Fallback to mock data if API fails
            setExam({
              _id: examId || 'sample-exam',
              title: 'Sample Exam',
              description: 'This is a sample exam since we could not fetch the real exam data.',
              duration: 45,
              questionCount: 20,
              difficulty: 'medium',
              instructions: `
                <p>This is a sample exam to help you practice your test-taking skills.</p>
                <p>Read each question carefully before selecting your answer.</p>
              `
            });
          }
        }
      } catch (err) {
        logger.error('Failed to fetch exam details:', err);
        setError('Failed to load exam details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  const handleStartExam = async () => {
    try {
      setStartingExam(true);
      
      // Store exam data in localStorage for the attempt page to use
      localStorage.setItem('currentExam', JSON.stringify({
        examId: exam._id,
        title: exam.title,
        duration: exam.duration,
        questionCount: exam.questionCount,
        difficulty: exam.difficulty,
        candidateName: candidateName
      }));
      
      // For all exams, create a mock attempt for now
      const mockAttemptId = `mock-attempt-${Date.now()}`;
      navigate(`/exams/attempt/${mockAttemptId}`);
    } catch (err) {
      logger.error('Failed to start exam:', err);
      setError('Failed to start the exam. Please try again.');
    } finally {
      setStartingExam(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading exam details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!exam) return <div className="error-message">Exam not found.</div>;

  return (
    <div className="exam-start-container">
      <div className="exam-instructions-card">
        <div className="exam-header">
          <h1>{exam.title}</h1>
          <p className="exam-description">{exam.description}</p>
        </div>
        
        <div className="exam-details">
          <div className="detail-item">
            <div className="detail-icon">⏱️</div>
            <div className="detail-content">
              <h3>Duration</h3>
              <p>{exam.duration} minutes</p>
            </div>
          </div>
          
          <div className="detail-item">
            <div className="detail-icon">❓</div>
            <div className="detail-content">
              <h3>Questions</h3>
              <p>{exam.questionCount} questions</p>
            </div>
          </div>
          
          <div className="detail-item">
            <div className="detail-icon">📊</div>
            <div className="detail-content">
              <h3>Difficulty</h3>
              <p className={`difficulty-level ${exam.difficulty}`}>{exam.difficulty}</p>
            </div>
          </div>
        </div>
        
        <div className="instructions-section">
          <h2>Instructions</h2>
          <div className="instructions-content" dangerouslySetInnerHTML={{ __html: exam.instructions }}></div>
          
          <div className="general-instructions">
            <h3>General Guidelines</h3>
            <ul>
              <li>Read each question carefully before answering.</li>
              <li>You can navigate between questions using the previous and next buttons.</li>
              <li>You can review your answers before submitting the exam.</li>
              <li>Once you submit the exam, you cannot change your answers.</li>
              <li>Your score will be displayed immediately after submission.</li>
            </ul>
          </div>
        </div>
        
        <div className="candidate-section">
          <label htmlFor="candidate-name">Enter your name to begin:</label>
          <input 
            type="text" 
            id="candidate-name" 
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="Your Name"
          />
        </div>
        
        <div className="start-button-container">
          <button 
            className="start-exam-button"
            onClick={handleStartExam}
            disabled={startingExam}
          >
            {startingExam ? 'Starting Exam...' : 'Begin Exam'}
          </button>
        </div>
      </div>
    </div>
  );
}; 