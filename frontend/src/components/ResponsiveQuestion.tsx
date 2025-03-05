import React, { useState, useEffect } from 'react';
import { Question } from './Question';
import MobileQuestion from './MobileQuestion';
import { isMobileDevice, getScreenWidth } from '../utils/mobileDetection';
import '../styles/MobileQuestion.css';

interface QuestionData {
  id?: string;
  title: string;
  content: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
}

interface ResponsiveQuestionProps {
  question: QuestionData;
  onSubmit: (answer: string, timeSpent: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showExplanation?: boolean;
}

const ResponsiveQuestion: React.FC<ResponsiveQuestionProps> = (props) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Check if the device is mobile on mount and on resize
  useEffect(() => {
    const checkMobile = () => {
      const isMobileCheck = isMobileDevice() || getScreenWidth() < 768;
      setIsMobile(isMobileCheck);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Render the appropriate component based on device type
  return isMobile ? (
    <MobileQuestion {...props} />
  ) : (
    <Question {...props} />
  );
};

export default ResponsiveQuestion; 