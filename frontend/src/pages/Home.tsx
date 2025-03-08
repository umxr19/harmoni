import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSafeAuth } from '../hooks/useSafeAuth';
import { withAuthAndErrorBoundary } from '../components/withAuth';
import ErrorBoundary from '../components/ErrorBoundary';
import { getPersonalizedWelcomeMessage } from '../utils/messageUtils';
import StudyScheduleCard from '../components/StudyScheduleCard';
import SubjectCard from '../components/SubjectCard';
import { onboardingService } from '../services/api';
import { Subject } from '../types';
import '../styles/Home.css';
import logger from '../utils/logger';
import useSwipe from '../hooks/useSwipe';

// Feature cards data structure
interface FeatureCard {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

// Screen size detection
type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Utility function to detect mobile devices
const isMobileDevice = () => {
  const width = window.innerWidth;
  
  // Check if it's a very small device (320px or 480px)
  const isVerySmallScreen = width <= 480;
  
  // Standard mobile detection
  const isMobileUserAgent = typeof navigator !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  return isVerySmallScreen || isMobileUserAgent;
};

// Get screen size category
const getScreenSize = (): ScreenSize => {
  const width = window.innerWidth;
  if (width <= 320) return 'xs';    // iPhone 5/SE (1st gen)
  if (width <= 375) return 'sm';    // iPhone SE (2nd gen)/iPhone X
  if (width <= 428) return 'md';    // iPhone 12 Pro Max
  if (width <= 768) return 'lg';    // Tablets
  return 'xl';                      // Larger screens
};

// Main component that uses auth directly
const HomeComponent: React.FC = () => {
  // Use the safe auth hook that won't throw errors
  const { isAuthenticated, currentUser } = useSafeAuth();
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState<ScreenSize>('lg');
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile and determine screen size
  useEffect(() => {
    const checkDimensions = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setScreenSize(getScreenSize());
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    checkDimensions();
    window.addEventListener('resize', checkDimensions);
    
    return () => {
      window.removeEventListener('resize', checkDimensions);
    };
  }, []);

  // Features cards data - shorter descriptions for small screens
  const getFeatureDescription = (longDesc: string, shortDesc: string) => {
    return (screenSize === 'xs' || screenSize === 'sm') ? shortDesc : longDesc;
  };

  const featureCards: FeatureCard[] = [
    {
      id: 1,
      title: "Mindful Study Plans",
      description: getFeatureDescription(
        "Create and follow customized study schedules tailored to your learning needs and goals.",
        "Custom study schedules for your needs."
      ),
      icon: "📚",
      color: "#6b46c1" // Purple
    },
    {
      id: 2,
      title: "Extensive Practice Questions",
      description: getFeatureDescription(
        "Access thousands of practice questions across various subjects and difficulty levels.",
        "Thousands of practice questions for all subjects."
      ),
      icon: "📝",
      color: "#3182ce" // Blue
    },
    {
      id: 3,
      title: "Full-Length Exams",
      description: getFeatureDescription(
        "Take timed exams that simulate real test conditions to improve your test-taking skills.",
        "Timed exams to improve test-taking skills."
      ),
      icon: "🎯",
      color: "#38a169" // Green
    },
    {
      id: 4,
      title: "Performance Analytics",
      description: getFeatureDescription(
        "Track your progress with detailed analytics and identify areas for improvement.",
        "Track progress and find areas to improve."
      ),
      icon: "📊",
      color: "#e53e3e" // Red
    },
    {
      id: 5,
      title: "Wellbeing Tools",
      description: getFeatureDescription(
        "Maintain a healthy balance with integrated wellbeing features designed for students.",
        "Stay balanced with wellbeing features."
      ),
      icon: "🧠",
      color: "#dd6b20" // Orange
    },
    // Adding the three feature overview cards
    {
      id: 6,
      title: "Mindful Learning",
      description: getFeatureDescription(
        "Adaptive learning paths that adjust to your progress and learning style.",
        "Adaptive learning that adjusts to your style."
      ),
      icon: "🔍",
      color: "#805ad5" // Purple variant
    },
    {
      id: 7,
      title: "Study Anywhere",
      description: getFeatureDescription(
        "Access your study materials on any device, anytime, anywhere.",
        "Study on any device, anytime, anywhere."
      ),
      icon: "📱",
      color: "#3182ce" // Blue
    },
    {
      id: 8,
      title: "AI Tutor Support",
      description: getFeatureDescription(
        "Get help from AI tutors and subject matter experts when you need it most.",
        "AI tutoring when you need it most."
      ),
      icon: "🤖",
      color: "#38a169" // Green
    }
  ];

  // Use the swipe hook for cards
  const { ref: swipeRef, direction } = useSwipe({
    onSwipeLeft: () => {
      if (currentCardIndex < featureCards.length - 1) {
        setSwipeDirection('left');
        setCurrentCardIndex(prevIndex => prevIndex + 1);
        
        // Reset direction after animation
        setTimeout(() => {
          setSwipeDirection(null);
        }, 300);
      }
    },
    onSwipeRight: () => {
      if (currentCardIndex > 0) {
        setSwipeDirection('right');
        setCurrentCardIndex(prevIndex => prevIndex - 1);
        
        // Reset direction after animation
        setTimeout(() => {
          setSwipeDirection(null);
        }, 300);
      }
    }
  }, { 
    threshold: screenSize === 'xs' ? 30 : screenSize === 'sm' ? 35 : 50,  // Lower threshold for very small devices
    minSwipeDistance: screenSize === 'xs' ? 20 : screenSize === 'sm' ? 25 : 30, // Make mobile swipes more sensitive
    preventDefault: false, // Don't interfere with scrolling
    passive: true // Better performance
  });

  // Set ref for the swiping container
  useEffect(() => {
    if (cardsContainerRef.current) {
      swipeRef.current = cardsContainerRef.current;
    }
  }, [swipeRef]);

  // Navigate to previous card
  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      setSwipeDirection('right');
      setCurrentCardIndex(prevIndex => prevIndex - 1);
      
      // Reset direction after animation
      setTimeout(() => {
        setSwipeDirection(null);
      }, 300);
    }
  };

  // Navigate to next card
  const goToNextCard = () => {
    if (currentCardIndex < featureCards.length - 1) {
      setSwipeDirection('left');
      setCurrentCardIndex(prevIndex => prevIndex + 1);
      
      // Reset direction after animation
      setTimeout(() => {
        setSwipeDirection(null);
      }, 300);
    }
  };

  // Handle enrollment button click
  const handleEnroll = () => {
    navigate('/register');
  };

  // Simplify features grid for very small screens
  const renderFeaturesGrid = () => {
    // For 320px screens, we don't render this section at all (hidden in CSS)
    if (screenSize === 'xs' && window.innerWidth <= 320) {
      return null;
    }
    
    // For other small screens, show limited content
    const isSmallScreen = screenSize === 'xs' || screenSize === 'sm';
    
    return (
      <div className="features-grid">
        <div className="feature-overview-item">
          <div className="feature-overview-icon">🔍</div>
          <h3>Mindful Learning</h3>
          {!isSmallScreen && (
            <p>Adaptive learning paths that adjust to your progress and learning style.</p>
          )}
        </div>
        <div className="feature-overview-item">
          <div className="feature-overview-icon">📱</div>
          <h3>Study Anywhere</h3>
          {!isSmallScreen && (
            <p>Access your study materials on any device, anytime, anywhere.</p>
          )}
        </div>
        {!isSmallScreen && (
          <div className="feature-overview-item">
            <div className="feature-overview-icon">👩‍🏫</div>
            <h3>Expert Support</h3>
            <p>Get help from subject matter experts when you need it most.</p>
          </div>
        )}
      </div>
    );
  };

  // Get welcome message based on screen size
  const getWelcomeText = () => {
    // Ultra-compact message for 320px
    return screenSize === 'xs' && window.innerWidth <= 320 
      ? "Start your mindful journey"
      : "Your mindful learning journey starts here.";
  };

  // Get appropriate swipe hint based on screen size
  const getSwipeHint = () => {
    return screenSize === 'xs' && window.innerWidth <= 320 
      ? "Swipe to explore" 
      : "Swipe or tap edges to navigate";
  };

  // Get appropriate button text based on screen size
  const getEnrollButtonText = () => {
    return screenSize === 'xs' && window.innerWidth <= 320 
      ? "Enroll" 
      : "Enroll Now";
  };

  // Handle tap on card to navigate (left half = previous, right half = next)
  const handleCardTap = (event: React.MouseEvent<HTMLDivElement>) => {
    const cardElement = event.currentTarget;
    const cardWidth = cardElement.clientWidth;
    const clickX = event.nativeEvent.offsetX;
    
    // If clicked on the left 1/3 of the card, go to previous card
    if (clickX < cardWidth / 3) {
      goToPrevCard();
    } 
    // If clicked on the right 1/3 of the card, go to next card
    else if (clickX > (cardWidth * 2) / 3) {
      goToNextCard();
    }
    // Middle section does nothing to allow for content interactions
  };

  return (
    <div className={`home-container first-time-home screen-${screenSize}`}>
      <section className="welcome-section">
        <div className="logo-container">
          <img 
            src="/Harmoni Logo Icon Only Clear.png" 
            alt="Harmoni Logo" 
            className="harmoni-logo"
          />
        </div>
        <h2>Welcome to Harmoni</h2>
        <p>{getWelcomeText()}</p>
      </section>
      
      <div className={`feature-cards-container ${swipeDirection ? `swiping-${swipeDirection}` : ''}`} ref={cardsContainerRef}>
        <div 
          className="feature-cards-slider" 
          style={{ transform: `translateX(calc(-${currentCardIndex * 100}%))` }}
        >
          {featureCards.map((card) => (
            <div 
              key={card.id} 
              className="feature-card"
              onClick={handleCardTap}
            >
              <div className="feature-card-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <div className="feature-card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              
              {/* Add subtle edge indicators */}
              {currentCardIndex > 0 && <div className="edge-indicator left"></div>}
              {currentCardIndex < featureCards.length - 1 && <div className="edge-indicator right"></div>}
            </div>
          ))}
        </div>
        
        {isMobile && (
          <div className="swipe-hint prominent">
            {getSwipeHint()}
          </div>
        )}
      </div>
      
      <div className="enrollment-cta">
        <button className="enroll-button" onClick={handleEnroll}>
          {getEnrollButtonText()}
        </button>
        <p className="login-text">
          Already have an account? <Link to="/login" className="login-link">Log in</Link>
        </p>
      </div>
    </div>
  );
};

// Default export using higher-order component for authentication and error handling
export default withAuthAndErrorBoundary(HomeComponent); 