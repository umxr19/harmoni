import React from 'react';
import { Link } from 'react-router-dom';
import { Subject } from '../types';
import '../styles/SubjectCard.css';

interface SubjectCardProps {
  subject: Subject;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  // Generate card style with left border
  const getCardStyle = () => {
    if (subject.color) {
      return { 
        backgroundColor: '#ffffff',
        borderLeft: `4px solid ${subject.color}`
      };
    }
    
    // Default style
    return {
      backgroundColor: '#ffffff',
      borderLeft: '4px solid #6b46c1'
    };
  };
  
  // Get subject emoji based on name
  const getSubjectEmoji = () => {
    const name = subject.name.toLowerCase();
    
    if (name.includes('math')) return '🔢';
    if (name.includes('english') || name.includes('language')) return '📚';
    if (name.includes('science')) return '🔬';
    if (name.includes('biology')) return '🧬';
    if (name.includes('chemistry')) return '⚗️';
    if (name.includes('physics')) return '⚛️';
    if (name.includes('history')) return '📜';
    if (name.includes('geography')) return '🌍';
    if (name.includes('computer') || name.includes('coding')) return '💻';
    if (name.includes('music')) return '🎵';
    if (name.includes('art')) return '🎨';
    if (name.includes('physical') || name.includes('pe')) return '🏃';
    
    // Default emoji if no match
    return '📖';
  };
  
  // Function to get appropriate tag based on the subject
  const getSubjectTag = () => {
    if (subject.isALevel) return 'A-Level';
    if (subject.isGCSE) return 'GCSE';
    if (subject.is11Plus) return '11+';
    return null;
  };
  
  const subjectTag = getSubjectTag();
  const subjectEmoji = getSubjectEmoji();
  
  return (
    <Link to={`/subjects/${subject.id}`} className="subject-card">
      <div className="subject-card-inner" style={getCardStyle()}>
        <div className="subject-emoji">{subjectEmoji}</div>
        <div className="subject-content">
          <div className="subject-header">
            <h3>{subject.name}</h3>
            {subjectTag && <span className="subject-tag">{subjectTag}</span>}
          </div>
          <p className="subject-description">{subject.description}</p>
          {subject.categories && subject.categories.length > 0 && (
            <div className="subject-categories">
              {subject.categories.slice(0, 2).map((category, index) => (
                <span key={index} className="subject-category">{category}</span>
              ))}
              {subject.categories.length > 2 && (
                <span className="subject-category-more">+{subject.categories.length - 2} more</span>
              )}
            </div>
          )}
        </div>
        <div className="subject-footer">
          <span className="start-studying">Start Studying</span>
          <span className="arrow-icon">→</span>
        </div>
      </div>
    </Link>
  );
};

export default SubjectCard; 