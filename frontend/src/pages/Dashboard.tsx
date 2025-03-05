import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { StudentDashboard } from './StudentDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { ParentDashboard } from './ParentDashboard';
import AdminDashboard from './AdminDashboard';
import '../styles/Dashboard.css';
import logger from '../utils/logger';

export const Dashboard: React.FC = () => {
  const { currentUser, isMockAuth } = useAuth();
  const navigate = useNavigate();

  if (isMockAuth) {
    logger.info('Using mock auth in Dashboard component');
  }

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  // Render different dashboard based on user role
  switch (currentUser.role) {
    case 'student':
      return <StudentDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <StudentDashboard />;
  }
}; 