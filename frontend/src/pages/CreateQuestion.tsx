import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../services/api';
import '../styles/CreateQuestion.css';
import logger from '../utils/logger';

interface Option {
  text: string;
  isCorrect: boolean;
}

export const CreateQuestion: React.FC = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [options, setOptions] = useState<Option[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [explanation, setExplanation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleCorrectOptionChange = (index: number) => {
    const newOptions = options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }));
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      setError('A question must have at least 2 options');
      return;
    }
    
    const newOptions = [...options];
    newOptions.splice(index, 1);
    
    // If we removed the correct option, set the first option as correct
    if (options[index].isCorrect && newOptions.length > 0) {
      newOptions[0].isCorrect = true;
    }
    
    setOptions(newOptions);
  };

  const addCategory = () => {
    if (!categoryInput.trim()) return;
    
    if (!category.includes(categoryInput.trim())) {
      setCategory([...category, categoryInput.trim()]);
    }
    
    setCategoryInput('');
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategory(category.filter(cat => cat !== categoryToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!question.trim()) {
      setError('Question text is required');
      return;
    }
    
    if (category.length === 0) {
      setError('At least one category is required');
      return;
    }
    
    const validOptions = options.filter(option => option.text.trim() !== '');
    if (validOptions.length < 2) {
      setError('At least two options are required');
      return;
    }
    
    const hasCorrectOption = options.some(option => option.isCorrect);
    if (!hasCorrectOption) {
      setError('Please mark one option as correct');
      return;
    }
    
    try {
      setLoading(true);
      
      // Filter out empty options
      const filteredOptions = options.filter(option => option.text.trim() !== '');
      
      await teacherService.createQuestion({
        question,
        category,
        subCategory: subCategory || undefined,
        difficulty,
        options: filteredOptions,
        explanation: explanation || undefined,
        imageUrl: imageUrl || undefined
      });
      
      navigate('/questions');
    } catch (err) {
      logger.error('Failed to create question:', err);
      setError('Failed to create question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-question-container">
      <h1>Create New Question</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="question">Question Text</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter the question text"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL (optional)</label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter an image URL if applicable"
          />
          {imageUrl && (
            <div className="image-preview">
              <img src={imageUrl} alt="Question preview" />
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label>Categories</label>
          <div className="category-input-group">
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="Enter a category"
            />
            <button 
              type="button" 
              className="add-button"
              onClick={addCategory}
            >
              Add
            </button>
          </div>
          
          {category.length > 0 && (
            <div className="category-tags">
              {category.map((cat, index) => (
                <div key={index} className="category-tag">
                  {cat}
                  <button 
                    type="button" 
                    className="remove-tag"
                    onClick={() => removeCategory(cat)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="subCategory">Sub-Category (optional)</label>
          <input
            type="text"
            id="subCategory"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            placeholder="Enter a sub-category"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Answer Options</label>
          <p className="form-hint">Mark one option as correct.</p>
          
          <div className="options-list">
            {options.map((option, index) => (
              <div key={index} className="option-item">
                <div className="option-input-group">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={option.isCorrect}
                    onChange={() => handleCorrectOptionChange(index)}
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
                <button 
                  type="button" 
                  className="remove-option"
                  onClick={() => removeOption(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            className="add-option-button"
            onClick={addOption}
          >
            Add Option
          </button>
        </div>
        
        <div className="form-group">
          <label htmlFor="explanation">Explanation (optional)</label>
          <textarea
            id="explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain why the correct answer is right"
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate('/questions')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Question'}
          </button>
        </div>
      </form>
    </div>
  );
}; 