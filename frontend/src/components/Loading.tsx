import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Loading component with customizable message and size
 */
const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  size = 'medium' 
}) => {
  // Size classes
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div 
        className={`${sizeClasses[size]} rounded-full border-t-purple-500 border-r-purple-200 border-b-purple-200 border-l-purple-200 animate-spin`}
      ></div>
      {message && (
        <p className="mt-2 text-purple-700 font-medium">{message}</p>
      )}
    </div>
  );
};

export default Loading; 