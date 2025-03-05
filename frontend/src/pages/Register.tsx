import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Register.css';
import logger from '../utils/logger';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student' // Default role is student and cannot be changed
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'parent' | 'child' | null>(null);
  
  const navigate = useNavigate();
  const { register, updateUserType, currentUser, isAuthenticated } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(formData);
      setRegistrationComplete(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUserTypeSelection = async (userType: 'parent' | 'child') => {
    setIsLoading(true);
    setError(null);
    
    try {
      setSelectedUserType(userType);
      
      // If user is authenticated, update the user type
      if (isAuthenticated && currentUser) {
        await updateUserType(userType);
      }
      
      // For parent users, go directly to dashboard
      if (userType === 'parent') {
        navigate('/dashboard');
      } else {
        // For child users, go to year group selection
        navigate('/onboarding/year-group');
      }
    } catch (err: any) {
      setError('Failed to set user type. Please try again.');
      logger.error('User type selection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // If registration is complete, show user type selection
  if (registrationComplete) {
    return (
      <div className="register-container">
        <h1>Almost Done!</h1>
        <p>Please tell us who will be using this account:</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="user-type-selection">
          <button 
            className="user-type-button"
            onClick={() => handleUserTypeSelection('parent')}
            disabled={isLoading}
          >
            <div className="user-type-icon">👨‍👩‍👧‍👦</div>
            <h3>I am a parent</h3>
            <p>Setting up this account for my child</p>
          </button>
          
          <button 
            className="user-type-button"
            onClick={() => handleUserTypeSelection('child')}
            disabled={isLoading}
          >
            <div className="user-type-icon">👨‍🎓</div>
            <h3>I am a student</h3>
            <p>Using this account for my own studies</p>
          </button>
        </div>
        
        {isLoading && <div className="loading-indicator">Processing...</div>}
      </div>
    );
  }

  // Initial registration form
  return (
    <div className="register-container">
      <h1>Create a Student Account</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div className="teacher-info">
        <p>Are you a teacher or tutor? <Link to="/teacher-signup">Click here</Link> to apply for a verified account.</p>
      </div>
      
      <p className="login-link">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}; 