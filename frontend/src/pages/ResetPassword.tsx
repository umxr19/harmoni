import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Auth.css';
import logger from '../utils/logger';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setValidating(false);
        setError('Invalid reset link. Please request a new one.');
        return;
      }

      logger.info('Starting token validation for:', token);
      
      // Direct fetch test
      try {
        logger.info('Trying direct fetch to test endpoint...');
        const testResponse = await fetch(`http://localhost:3001/api/test/always-valid`);
        const testData = await testResponse.json();
        logger.info('Test endpoint response:', testData);
        
        // If we can reach the test endpoint, try the token validation directly
        logger.info('Trying direct fetch to token validation endpoint...');
        const directResponse = await fetch(`http://localhost:3001/api/auth/reset-password/${token}/validate`);
        const directData = await directResponse.json();
        logger.info('Direct token validation response:', directData);
        
        if (directData.valid) {
          logger.info('Token is valid according to direct fetch');
          setTokenValid(true);
          setValidating(false);
          return;
        }
      } catch (directError) {
        logger.error('Direct fetch error:', directError);
      }
      
      // Fall back to the regular API service if direct fetch fails
      try {
        const response = await authService.validateResetToken(token);
        logger.info('Token validation response from service:', response);
        
        if (response.data && response.data.valid) {
          logger.info('Token is valid for user:', response.data.email);
          setTokenValid(true);
        } else {
          logger.error('Token validation failed with unexpected response:', response);
          setError('This password reset link is invalid or has expired. Please request a new one.');
          setTokenValid(false);
        }
      } catch (err: any) {
        logger.error('Token validation error:', err);
        const errorMessage = err.response?.data?.details || 
                            err.response?.data?.error || 
                            'This password reset link is invalid or has expired.';
        logger.error('Error message:', errorMessage);
        setError(errorMessage);
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('Invalid reset token');
        return;
      }
      
      await authService.resetPassword(token, password);
      
      // Show success message and redirect to login
      alert('Your password has been reset successfully. You can now log in with your new password.');
      navigate('/login');
    } catch (err: any) {
      logger.error('Password reset error:', err);
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Reset Password</h1>
          </div>
          <div className="loading-message">Validating your reset link...</div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Invalid Reset Link</h1>
          </div>
          <div className="error-message">
            {error || 'This password reset link is invalid or has expired.'}
          </div>
          <div className="auth-footer">
            <Link to="/forgot-password" className="request-new-link">Request a new reset link</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Your Password</h1>
          <p>Please enter your new password below.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              minLength={8}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              minLength={8}
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}; 