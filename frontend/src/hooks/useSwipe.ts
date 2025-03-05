import { useState, useEffect, useRef } from 'react';
import logger from '../utils/logger';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions {
  threshold?: number;
  preventDefault?: boolean;
  passive?: boolean;
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  disabled?: boolean;
}

/**
 * Custom hook for handling swipe gestures on mobile devices
 * @param handlers - Object containing callback functions for different swipe directions
 * @param options - Configuration options for the swipe detection
 * @returns An object with ref to attach to the element and the current swipe state
 */
export const useSwipe = (
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
) => {
  const { 
    threshold = 50, 
    preventDefault = false, 
    passive = true,
    minSwipeDistance = 30,
    maxSwipeTime = 500,
    disabled = false
  } = options;
  
  const [swiping, setSwiping] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const elementRef = useRef<HTMLElement | null>(null);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const initialScrollPosRef = useRef<{x: number, y: number}>({x: 0, y: 0});
  const isVerticalScrollRef = useRef<boolean>(false);
  const isHorizontalScrollRef = useRef<boolean>(false);

  useEffect(() => {
    if (disabled) return; // Don't attach listeners if disabled
    
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      try {
        if (e.touches.length !== 1) return; // Only handle single-touch events
        
        const touch = e.touches[0];
        startXRef.current = touch.clientX;
        startYRef.current = touch.clientY;
        currentXRef.current = touch.clientX;
        currentYRef.current = touch.clientY;
        startTimeRef.current = Date.now();
        
        // Store initial scroll position
        if (typeof window !== 'undefined') {
          initialScrollPosRef.current = {
            x: window.scrollX,
            y: window.scrollY
          };
        }
        
        isVerticalScrollRef.current = false;
        isHorizontalScrollRef.current = false;
        
        setSwiping(true);
        setDirection(null);
        setError(null);
      } catch (err) {
        logger.error('Error in touch start handler:', err);
        setError('Touch start error');
        setSwiping(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      try {
        if (!swiping || e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        const newX = touch.clientX;
        const newY = touch.clientY;
        
        // Calculate deltas
        const deltaX = newX - startXRef.current;
        const deltaY = newY - startYRef.current;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        // Determine scroll direction if not already set
        if (!isVerticalScrollRef.current && !isHorizontalScrollRef.current) {
          if (absY > absX && absY > 10) {
            isVerticalScrollRef.current = true;
          } else if (absX > absY && absX > 10) {
            isHorizontalScrollRef.current = true;
          }
        }
        
        // Only prevent default if it's a horizontal swipe and the option is set
        if (preventDefault && !passive && isHorizontalScrollRef.current) {
          e.preventDefault();
        }
        
        currentXRef.current = newX;
        currentYRef.current = newY;
      } catch (err) {
        logger.error('Error in touch move handler:', err);
        setError('Touch move error');
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      try {
        if (!swiping) return;
        
        // Check if this was a scroll action
        if (typeof window !== 'undefined') {
          const scrollDeltaX = Math.abs(window.scrollX - initialScrollPosRef.current.x);
          const scrollDeltaY = Math.abs(window.scrollY - initialScrollPosRef.current.y);
          
          // If there was significant scrolling, don't register as a swipe
          if (scrollDeltaX > 10 || scrollDeltaY > 10) {
            setSwiping(false);
            return;
          }
        }
        
        // Ignore vertical swipes (likely scrolling)
        if (isVerticalScrollRef.current) {
          setSwiping(false);
          return;
        }
        
        const touchTime = Date.now() - startTimeRef.current;
        const deltaX = currentXRef.current - startXRef.current;
        const deltaY = currentYRef.current - startYRef.current;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        // Check if the swipe was fast enough and long enough
        const isValidSwipe = touchTime <= maxSwipeTime && 
                            (absX >= minSwipeDistance || absY >= minSwipeDistance);
        
        if (isValidSwipe) {
          // Horizontal swipes are more likely to be intentional gestures rather than scrolling
          if (absX > absY && absX > threshold) {
            if (deltaX > 0) {
              setDirection('right');
              handlers.onSwipeRight?.();
            } else {
              setDirection('left');
              handlers.onSwipeLeft?.();
            }
          } 
          // Only handle vertical swipes if they are very distinct and clearly not scrolling
          else if (absY > absX && absY > threshold * 1.5 && !isVerticalScrollRef.current) {
            if (deltaY > 0) {
              setDirection('down');
              handlers.onSwipeDown?.();
            } else {
              setDirection('up');
              handlers.onSwipeUp?.();
            }
          }
        }
        
        // Reset state
        setSwiping(false);
      } catch (err) {
        logger.error('Error in touch end handler:', err);
        setError('Touch end error');
        setSwiping(false);
      }
    };

    // Ensure touchcancel also resets state
    const handleTouchCancel = () => {
      setSwiping(false);
    };

    try {
      const listenerOptions = { passive };
      
      element.addEventListener('touchstart', handleTouchStart, listenerOptions);
      element.addEventListener('touchmove', handleTouchMove, listenerOptions);
      element.addEventListener('touchend', handleTouchEnd, listenerOptions);
      element.addEventListener('touchcancel', handleTouchCancel, listenerOptions);

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
        element.removeEventListener('touchcancel', handleTouchCancel);
      };
    } catch (err) {
      logger.error('Error setting up touch listeners:', err);
      setError('Touch listener setup error');
      return () => {};
    }
  }, [handlers, swiping, threshold, preventDefault, passive, minSwipeDistance, maxSwipeTime, disabled]);

  return {
    ref: elementRef,
    swiping,
    direction,
    error,
    isActive: !disabled
  };
};

export default useSwipe; 