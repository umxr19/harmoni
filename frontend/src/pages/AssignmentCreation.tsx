import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { classroomService, questionService } from '../services/api';
import '../styles/AssignmentCreation.css';
import logger from '../utils/logger';

interface Classroom {
  _id: string;
  name: string;
}

interface Question {
  _id: string;
  question: string;
  category: string[];
  difficulty: string;
}

export const AssignmentCreation: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    classroomId: '',
    questions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If classroomId is passed via state, use it
    if (location.state && location.state.classroomId) {
      setFormData(prev => ({
        ...prev,
        classroomId: location.state.classroomId
      }));
    }
  }, [location]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch teacher's classrooms
        const classroomsResponse = await classroomService.getTeacherClassrooms();
        setClassrooms(classroomsResponse.data);
        
        // Fetch questions
        const questionsResponse = await questionService.getQuestions();
        setQuestions(questionsResponse.data);
        setFilteredQuestions(questionsResponse.data);
        
      } catch (err) {
        logger.error('Failed to fetch data:', err);
        setError('Failed to load necessary data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter questions based on search, categories, and difficulty
    let filtered = [...questions];
    
    if (formData.searchQuery) {
      const query = formData.searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(query)
      );
    }
    
    if (formData.categories.length > 0) {
      filtered = filtered.filter(q => 
        formData.categories.some(cat => q.category.includes(cat))
      );
    }
    
    if (formData.difficulty) {
      filtered = filtered.filter(q => q.difficulty === formData.difficulty);
    }
    
    setFilteredQuestions(filtered);
  }, [formData.searchQuery, formData.categories, formData.difficulty, questions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedCategories = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedCategories.push(options[i].value);
      }
    }
    
    setFormData(prev => ({ ...prev, categories: selectedCategories }));
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Mock successful creation
      logger.info('Assignment created:', formData);
      
      // Redirect to classroom details
      navigate(`/classrooms/${formData.classroomId}`);
    } catch (err) {
      logger.error('Failed to create assignment:', err);
      setError('Failed to create assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="assignment-creation-container">
      <div className="creation-header">
        <h1>Create New Assignment</h1>
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="assignment-form">
        <div className="form-group">
          <label htmlFor="title">Assignment Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Enter assignment title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Enter assignment description"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="datetime-local"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="create-btn"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
}; 