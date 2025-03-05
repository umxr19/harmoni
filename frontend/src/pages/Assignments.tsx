import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSafeAuth } from '../hooks/useSafeAuth';
import { classroomService } from '../services/api';
import '../styles/Assignments.css';
import logger from '../utils/logger';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  classroomId: string;
  classroomName?: string;
  completed?: boolean;
}

export const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useSafeAuth();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await classroomService.getStudentAssignments();
      
      // Sort assignments by due date (closest first)
      const sortedAssignments = [...response.data].sort((a, b) => {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      
      setAssignments(sortedAssignments);
      setError(null);
    } catch (err) {
      logger.error('Failed to fetch assignments:', err);
      setError('Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate days remaining until due date
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return '1 day left';
    } else {
      return `${diffDays} days left`;
    }
  };

  return (
    <div className="assignments-container">
      <div className="assignments-header">
        <h1>My Assignments</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-spinner">Loading assignments...</div>
      ) : assignments.length > 0 ? (
        <div className="assignments-list">
          {assignments.map(assignment => (
            <Link 
              key={assignment._id} 
              to={`/assignments/${assignment._id}`}
              className="assignment-card"
            >
              <div className="assignment-details">
                <h3>{assignment.title}</h3>
                <p className="assignment-classroom">{assignment.classroomName || 'Unknown Classroom'}</p>
                <p className="assignment-description">{assignment.description || 'No description available.'}</p>
              </div>
              <div className="assignment-due-date">
                <p className="due-date">{formatDate(assignment.dueDate)}</p>
                <p className={`days-remaining ${getDaysRemaining(assignment.dueDate) === 'Overdue' ? 'overdue' : ''}`}>
                  {getDaysRemaining(assignment.dueDate)}
                </p>
                {assignment.completed && <span className="completed-badge">Completed</span>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="no-data-container">
          <div className="no-data-message">
            <h2>No Assignments Found</h2>
            <p>You don't have any assignments at the moment.</p>
            <p>When your teachers assign work to you, it will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}; 