import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Auth.css';
import '../styles/MobileAuth.css';
import axios from 'axios';
import { getApiBaseUrl } from '../services/api';
import logger from '../utils/logger';

export const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] = useState<'network' | 'credentials' | 'generic' | 'success' | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
    const [showConnectionTest, setShowConnectionTest] = useState(false);
    const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
    const navigate = useNavigate();
    const auth = useAuth();
    const { login, isAuthenticated, isMockAuth, isLoading: authLoading } = auth;

    // Log auth state for debugging
    useEffect(() => {
        logger.info('Login component auth state:', {
            isAuthenticated,
            isMockAuth,
            hasAuthMethods: !!login,
            loginType: login ? typeof login : 'undefined',
            loginSource: login ? login.toString().substring(0, 50) + '...' : 'N/A',
            authLoading
        });
        
        // If already authenticated, redirect to dashboard
        if (isAuthenticated) {
            logger.info('User already authenticated, redirecting to dashboard');
            navigate('/dashboard');
        }
    }, [isAuthenticated, isMockAuth, login, navigate, authLoading]);

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

        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            setErrorType('generic');
            return;
        }

        try {
            setLoading(true);
            logger.info('Attempting login with email:', formData.email);
            
            if (!login || typeof login !== 'function') {
                throw new Error('Login function is not available');
            }
            
            // First, check if we can connect to the API at all
            try {
                const apiBaseUrl = getApiBaseUrl();
                const response = await axios.get(`${apiBaseUrl.replace('/api', '')}/api/debug/mobile-ping`, {
                    timeout: 3000
                });
                logger.info('API connectivity check successful:', response.data);
            } catch (connectError) {
                logger.error('API connectivity check failed:', connectError);
                throw {
                    isNetworkError: true,
                    userMessage: 'Cannot connect to the server. Please check your network connection and ensure the backend server is running.'
                };
            }
            
            // If we got here, the API is reachable, so attempt login
            await login(formData.email, formData.password);
            
            logger.info('Login successful, redirecting to dashboard');
            navigate('/dashboard');
        } catch (error: any) {
            setLoading(false);
            
            // Check for specific error types
            if (error.isNetworkError) {
                // Increment retry count for network errors
                setRetryCount(prev => prev + 1);
                
                // Network error - show connectivity error message with more details
                setError(error.userMessage || 'Cannot connect to the server. The backend server may not be running or is unreachable.');
                setErrorType('network');
                
                // Show connection test button after multiple network errors
                if (retryCount >= 1) {
                    setShowConnectionTest(true);
                }
            } else if (error.isAuthError || error.isCredentialError) {
                // Authentication error - show invalid credentials message
                setError(error.userMessage || 'Invalid email or password. Please check your credentials and try again.');
                setErrorType('credentials');
                
                // Reset retry count for auth errors
                setRetryCount(0);
                setShowConnectionTest(false);
            } else if (error.isRateLimitError) {
                // Rate limiting error
                setError(error.userMessage || 'Too many login attempts. Please try again later.');
                setErrorType('generic');
                
                // Show a countdown timer for rate limit errors
                setRateLimitCountdown(30); // 30 seconds countdown
                const countdownInterval = setInterval(() => {
                    setRateLimitCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(countdownInterval);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                // Generic error
                setError(error.userMessage || error.message || 'An unexpected error occurred. Please try again later.');
                setErrorType('generic');
                
                logger.error('Generic login error:', error);
            }
        }
    };

    const testBackendConnection = async () => {
        setTestingConnection(true);
        setConnectionStatus('testing');
        try {
            // Try multiple endpoints
            const endpoints = [
                '/api/debug/mobile-ping',
                '/api/health',
                '/api/ping',
                '/health',
                '/'
            ];
            
            // Define base URLs to try - including the specific IP address
            const baseUrls = [
                getApiBaseUrl().replace('/api', ''),
                'http://192.168.1.67:3000' // Development machine's IP address
            ];
            
            // Try each combination of base URL and endpoint
            for (const baseUrl of baseUrls) {
                logger.info(`Testing with base URL: ${baseUrl}`);
                
                for (const endpoint of endpoints) {
                    try {
                        const fullUrl = `${baseUrl}${endpoint}`;
                        logger.info(`Testing connection to ${fullUrl}...`);
                        
                        const response = await axios.get(fullUrl, {
                            timeout: 5000
                        });
                        
                        if (response.status === 200) {
                            logger.info(`Connection successful to ${endpoint} via ${baseUrl}`);
                            setConnectionStatus('success');
                            setError(`Connection successful! The backend server is running and reachable at ${baseUrl}.`);
                            setErrorType('success');
                            setTestingConnection(false);
                            return;
                        }
                    } catch (endpointError) {
                        logger.info(`Failed to connect to ${endpoint} via ${baseUrl}`);
                    }
                }
            }
            
            // If all endpoints failed
            setConnectionStatus('failed');
            setError(`Connection failed. The backend server is not running or not reachable at any of the tried addresses.`);
            setErrorType('network');
        } catch (error) {
            logger.error('Connection test failed:', error);
            setConnectionStatus('failed');
            setError('Connection test failed. The backend server is not reachable.');
            setErrorType('network');
        } finally {
            setTestingConnection(false);
        }
    };

    // Show loading state while auth is initializing
    if (authLoading) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Loading...</h1>
                        <p>Initializing authentication system</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Log in to access your 11+ Question Bank account</p>
                    {isMockAuth && (
                        <div className="mock-auth-notice">
                            <p style={{ color: 'orange', fontWeight: 'bold' }}>
                                Using mock authentication (development mode)
                            </p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className={`error-message ${
                        errorType === 'network' 
                            ? 'network-error' 
                            : errorType === 'credentials' 
                                ? 'credential-error' 
                                : errorType === 'success'
                                    ? 'success-message'
                                    : 'generic-error'
                    }`}>
                        {error}
                        {errorType === 'network' && (
                            <div className="error-help-text">
                                <p>Try the following:</p>
                                <ul>
                                    <li>Check that the backend server is running on port 3000</li>
                                    <li>Make sure both frontend and backend servers are started</li>
                                    <li>Verify the API URL is set to http://localhost:3000/api</li>
                                    {retryCount > 1 && (
                                        <li><strong>Server issue detected!</strong> The backend server at port 3000 is not responding. Please restart the backend server.</li>
                                    )}
                                </ul>
                                {(showConnectionTest || retryCount > 0) && (
                                    <button 
                                        onClick={testBackendConnection} 
                                        disabled={testingConnection}
                                        className="test-connection-button"
                                    >
                                        {testingConnection ? 'Testing Connection...' : 'Test Backend Connection'}
                                    </button>
                                )}
                                {connectionStatus === 'failed' && (
                                    <div className="connection-status-failed">
                                        <p>Connection test failed. Please ensure the backend server is running.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {errorType === 'credentials' && (
                            <div className="error-help-text">
                                <p>Please check your email and password and try again.</p>
                            </div>
                        )}
                        {rateLimitCountdown > 0 && (
                            <div className="rate-limit-countdown">
                                <p>Too many login attempts. Please try again in {rateLimitCountdown} seconds.</p>
                                <div className="progress-bar">
                                    <div 
                                        className="progress" 
                                        style={{ width: `${(rateLimitCountdown / 30) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {auth.error && <div className="auth-error">{auth.error}</div>}

                {!error && connectionStatus === 'idle' && (
                    <div className="connection-test">
                        <button 
                            onClick={testBackendConnection} 
                            disabled={testingConnection}
                            className="test-connection-button secondary"
                        >
                            {testingConnection ? 'Testing Connection...' : 'Test Backend Connection'}
                        </button>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
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
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="auth-button" 
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Sign up</Link></p>
                    <p style={{ marginTop: '10px' }}><Link to="/forgot-password">Forgot password?</Link></p>
                </div>
            </div>
        </div>
    );
}; 