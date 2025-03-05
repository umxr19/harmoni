import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { classroomService } from '../services/api';
import '../styles/ClassroomManagement.css';
import logger from '../utils/logger';

interface Classroom {
  _id: string;
  name: string;
  description: string;
  teacherId: string;
  studentCount: number;
  createdAt: string;
}

export const ClassroomManagement: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gradeLevel: '',
    subject: ''
  });
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await classroomService.getTeacherClassrooms();
      setClassrooms(response.data);
      setError(null);
    } catch (err) {
      logger.error('Failed to fetch classrooms:', err);
      setError('Failed to load classrooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await classroomService.createClassroom(formData);
      
      // Reset form and fetch updated classrooms
      setFormData({
        name: '',
        description: '',
        gradeLevel: '',
        subject: ''
      });
      setShowCreateForm(false);
      await fetchClassrooms();
      
    } catch (err) {
      logger.error('Failed to create classroom:', err);
      setError('Failed to create classroom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClassroom = async (classroomId: string) => {
    if (window.confirm('Are you sure you want to delete this classroom? This action cannot be undone.')) {
      try {
        await classroomService.deleteClassroom(classroomId);
        // Remove the deleted classroom from state
        setClassrooms(prev => prev.filter(classroom => classroom._id !== classroomId));
      } catch (err) {
        logger.error('Failed to delete classroom:', err);
        setError('Failed to delete classroom. Please try again.');
      }
    }
  };

  const navigateToClassroom = (classroomId: string) => {
    navigate(`/classrooms/${classroomId}`);
  };

  const navigateToInvite = (classroomId: string) => {
    navigate(`/classrooms/${classroomId}/invite`);
  };

  if (loading && classrooms.length === 0) {
    return <div className="loading-spinner">Loading classrooms...</div>;
  }

  return (
    <div className="classroom-management-container">
      <div className="management-header">
        <h1>Classroom Management</h1>
        <button 
          className="create-classroom-btn"
          onClick={() => setShowCreateForm(true)}
        >
          Create New Classroom
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {classrooms.length > 0 ? (
        <div className="classrooms-grid">
          {classrooms.map(classroom => (
            <div key={classroom._id} className="classroom-card">
              <div className="classroom-header">
                <div className="classroom-title">
                  <h2>{classroom.name}</h2>
                  <div className="classroom-date">
                    Created on {new Date(classroom.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="classroom-menu">
                  <button className="menu-button">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                  <div className="menu-dropdown">
                    <button onClick={() => navigateToClassroom(classroom._id)}>
                      View Details
                    </button>
                    <button onClick={() => navigateToInvite(classroom._id)}>
                      Invite Students
                    </button>
                    <button onClick={() => handleDeleteClassroom(classroom._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="classroom-description">
                {classroom.description || 'No description provided.'}
              </div>
              
              <div className="classroom-stats">
                <div className="stat-item">
                  <div className="stat-value">{classroom.studentCount}</div>
                  <div className="stat-label">Students</div>
                </div>
              </div>
              
              <div className="classroom-actions">
                <button 
                  className="view-btn"
                  onClick={() => navigateToClassroom(classroom._id)}
                >
                  View Classroom
                </button>
                <button 
                  className="invite-btn"
                  onClick={() => navigateToInvite(classroom._id)}
                >
                  Invite Students
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-classrooms-message">
          <h2>No Classrooms Found</h2>
          <p>You haven't created any classrooms yet. Create your first classroom to get started.</p>
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="create-classroom-modal">
            <div className="modal-header">
              <h2>Create New Classroom</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="styled-form">
              <div className="form-group">
                <label htmlFor="name">Classroom Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Math 101, Science Class, etc."
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a brief description of this classroom"
                  rows={4}
                  className="form-control"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gradeLevel">Grade Level</label>
                  <select
                    id="gradeLevel"
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="">Select Grade Level</option>
                    <option value="elementary">Elementary School</option>
                    <option value="middle">Middle School</option>
                    <option value="high">High School</option>
                    <option value="college">College/University</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics, Science, etc."
                    className="form-control"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="create-btn primary-button"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Classroom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 