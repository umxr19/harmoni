import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import logger from '../utils/logger';

// Define the shape of our context
interface RechartsContextType {
  rechartsModule: any | null;
  isLoading: boolean;
  hasError: boolean;
  error: Error | null;
}

// Create the context with a default value
const RechartsContext = createContext<RechartsContextType>({
  rechartsModule: null,
  isLoading: true,
  hasError: false,
  error: null
});

// Hook to use the Recharts context
export const useRecharts = () => useContext(RechartsContext);

interface RechartsProviderProps {
  children: ReactNode;
}

/**
 * RechartsProvider - A component that loads Recharts and provides it via context
 * This ensures that all Recharts components use the same React instance
 */
export const RechartsProvider: React.FC<RechartsProviderProps> = ({ children }) => {
  const [rechartsModule, setRechartsModule] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRecharts = async () => {
      try {
        // Dynamically import Recharts
        const module = await import('recharts');
        
        // Ensure we're using the same React instance
        if (module && typeof window !== 'undefined') {
          // Make React available globally for Recharts
          if (!window.React) {
            window.React = React;
          }
        }
        
        if (isMounted) {
          setRechartsModule(module);
          setIsLoading(false);
        }
      } catch (err) {
        logger.error('Failed to load Recharts:', err);
        if (isMounted) {
          setHasError(true);
          setError(err instanceof Error ? err : new Error('Unknown error loading Recharts'));
          setIsLoading(false);
        }
      }
    };

    loadRecharts();

    return () => {
      isMounted = false;
    };
  }, []);

  const contextValue: RechartsContextType = {
    rechartsModule,
    isLoading,
    hasError,
    error
  };

  return (
    <RechartsContext.Provider value={contextValue}>
      {children}
    </RechartsContext.Provider>
  );
};

export default RechartsProvider; 