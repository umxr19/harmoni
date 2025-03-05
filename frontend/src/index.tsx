import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MockAuthProvider } from './contexts/mockAuthContext';
import App from './App';
import './styles/index.css';
import { fixChartJSReactIssues } from './utils/checkReactDuplicates';
import { createSafeChartEnvironment } from './utils/chartUtils';
import { applyChartJSPatches } from './utils/patchChartJS';
import logger from './utils/logger';

// Fix common issues with React and Chart.js
fixChartJSReactIssues();

// Create a safe environment for Chart.js
createSafeChartEnvironment();

// Apply patches for Chart.js
applyChartJSPatches();

// Make React available globally
if (typeof window !== 'undefined') {
  window.React = React;
  // Use the full ReactDOM import for the window object
  try {
    const fullReactDOM = require('react-dom');
    window.ReactDOM = fullReactDOM;
  } catch (error) {
    logger.error('Error setting ReactDOM on window:', error);
  }
}

// Check if we should use mock auth in development
const useMockAuth = process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_AUTH === 'true';

logger.info('Application starting with configuration:', {
  environment: process.env.NODE_ENV,
  useMockAuth,
  apiUrl: process.env.REACT_APP_API_URL
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* MockAuthProvider is only used as a fallback when real auth fails */}
        <MockAuthProvider>
          <App />
        </MockAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
); 