import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/ThemeToggle.css';

export const ThemeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="theme-toggle-container">
      <span className="theme-icon light">☀️</span>
      <label className="switch">
        <input 
          type="checkbox" 
          checked={darkMode} 
          onChange={toggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        />
        <span className="slider round"></span>
      </label>
      <span className="theme-icon dark">🌙</span>
    </div>
  );
}; 