import React, { memo } from 'react';
import '../styles/ActivityCard.css';

interface ActivityCardProps {
  title: string;
  date: string;
  score?: number;
  category?: string;
  topics?: string[];
  icon?: React.ReactNode;
  onClick?: () => void;
}

// Using React.memo to prevent unnecessary re-renders
const ActivityCard: React.FC<ActivityCardProps> = memo(({
  title,
  date,
  score,
  category,
  topics = [],
  icon,
  onClick
}) => {
  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Default icon if none provided
  const defaultIcon = (
    <div className="default-icon">
      {title.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div className="activity-card" onClick={onClick} role={onClick ? "button" : undefined}>
      <div className="activity-icon">
        {icon || defaultIcon}
      </div>
      <div className="activity-content">
        <h3 className="activity-title">{title}</h3>
        <div className="activity-details">
          <span>{formattedDate}</span>
          {score !== undefined && (
            <span className="activity-score">{score}%</span>
          )}
          {category && (
            <span className="activity-category">{category}</span>
          )}
        </div>
        {topics.length > 0 && (
          <div className="activity-topics">
            {topics.slice(0, 3).map((topic, index) => (
              <span key={`${topic}-${index}`} className="activity-topic-pill">
                {topic}
              </span>
            ))}
            {topics.length > 3 && (
              <span className="activity-topic-pill">
                +{topics.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to determine if component should re-render
  return (
    prevProps.title === nextProps.title &&
    prevProps.date === nextProps.date &&
    prevProps.score === nextProps.score &&
    prevProps.category === nextProps.category &&
    JSON.stringify(prevProps.topics) === JSON.stringify(nextProps.topics) &&
    prevProps.onClick === nextProps.onClick
  );
});

ActivityCard.displayName = 'ActivityCard';

export default ActivityCard; 