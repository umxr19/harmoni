import React from 'react';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="app-footer-container">
        <p className="app-copyright">
          © {currentYear} Harmoni. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 