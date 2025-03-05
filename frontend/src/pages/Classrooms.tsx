import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSafeAuth } from '../hooks/useSafeAuth';
import { classroomService } from '../services/api';
import '../styles/Classrooms.css';
import logger from '../utils/logger';

interface Classroom {
  _id: string;
  name: string;
  description: string;
  teacherId: string;
  teacherName?: string;
}

export const Classrooms: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useSafeAuth();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await classroomService.getStudentClassrooms();
      setClassrooms(response.data);
      setError(null);
    } catch (err) {
      logger.error('Failed to fetch classrooms:', err);
      setError('Failed to load classrooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="classrooms-container">
      <div className="classrooms-header">
        <h1>My Classrooms</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-spinner">Loading classrooms...</div>
      ) : classrooms.length > 0 ? (
        <div className="classrooms-grid">
          {classrooms.map(classroom => (
            <Link 
              key={classroom._id} 
              to={`/classrooms/${classroom._id}`}
              className="classroom-card"
            >
              <h3>{classroom.name}</h3>
              <p className="classroom-description">{classroom.description || 'No description available.'}</p>
              <p className="classroom-teacher">Teacher: {classroom.teacherName || 'Unknown'}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="no-data-container">
          <div className="no-data-message">
            <h2>No Classrooms Found</h2>
            <p>You are not currently enrolled in any classrooms.</p>
            <p>When you join a classroom, it will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}; 