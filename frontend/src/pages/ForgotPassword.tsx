import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Auth.css';
import logger from '../utils/logger';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.forgotPassword(email);
      
      // Check if the response contains a test email URL (for development)
      if (response.data?.testEmailUrl) {
        logger.info('Test email URL:', response.data.testEmailUrl);
        setSuccess(true);
        // You could add a note about checking the console for the test email URL
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      logger.error('Password reset error:', err);
      setError(err.response?.data?.error || 'Failed to send password reset email. Please try again.');
      
      // If we're in development mode, still show success even if email fails
      // This allows testing the flow without actual email delivery
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Development mode: Showing success despite email error');
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your email address and we'll send you instructions to reset your password.</p>
        </div>
        
        {success ? (
          <div className="success-message">
            <p>Password reset email sent! Please check your inbox and follow the instructions to reset your password.</p>
            <p>If you don't see the email, please check your spam folder.</p>
            <Link to="/login" className="back-to-login">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div className="auth-footer">
              <p>Remember your password? <Link to="/login">Log in</Link></p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}; 