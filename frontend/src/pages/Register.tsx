import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Auth.css';
import '../styles/MobileAuth.css';
import '../styles/animations.css';
import '../styles/UserTypeSelection.css';
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
  const particlesRef = useRef<HTMLDivElement>(null);
  
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

  const createParticles = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if (!particlesRef.current) return;
    
    const button = e.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    const particles = particlesRef.current;
    
    // Clear any existing particles
    particles.innerHTML = '';
    
    // Create new particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random position within the button
      const x = Math.random() * buttonRect.width;
      const y = Math.random() * buttonRect.height;
      
      // Random direction for the particle to float
      const tx = (Math.random() - 0.5) * 100;
      const ty = (Math.random() - 0.5) * 100;
      
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      particles.appendChild(particle);
      
      // Trigger animation with a slight delay for each particle
      setTimeout(() => {
        particle.classList.add('particle-animation');
      }, Math.random() * 200);
    }
  };

  // If registration is complete, show user type selection
  if (registrationComplete) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Almost Done!</h1>
            <p>Please tell us who will be using this account:</p>
          </div>
          
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
      </div>
    );
  }

  // Initial registration form
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="flex flex-wrap justify-center items-baseline gap-2">
            <span className="welcome-text text-gray-800">Create Account,</span>
            <span className="word-flip-container inline-flex items-baseline">
              <span className="flip-word">Teacher</span>
              <span className="flip-word">Doctor</span>
              <span className="flip-word">Scientist</span>
              <span className="flip-word">Engineer</span>
              <span className="flip-word">Artist</span>
              <span className="flip-word">Lawyer</span>
              <span className="flip-word">Architect</span>
              <span className="flip-word">Accountant</span>
              <span className="flip-word">Entrepreneur</span>
              <span className="flip-word">Professor</span>
              <span className="flip-word">Psychologist</span>
              <span className="flip-word">Librarian</span>
            </span>
          </h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
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
              placeholder="Create a password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={isLoading}
            onMouseEnter={createParticles}
            onTouchStart={createParticles}
          >
            <div className="particles" ref={particlesRef}></div>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="teacher-info">
          <p>Are you a teacher or tutor? <Link to="/teacher-signup">Click here</Link> to apply for a verified account.</p>
        </div>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}; 