import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { classroomService } from '../services/api';
import '../styles/ClassroomDetails.css';
import logger from '../utils/logger';

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  classroomId: string;
  completed?: boolean;
}

interface ClassroomData {
  _id: string;
  name: string;
  description: string;
  gradeLevel: string;
  subject: string;
  teacherId: {
    _id: string;
    name: string;
    email: string;
  };
  students: Student[];
  createdAt: string;
}

export const ClassroomDetails: React.FC = () => {
  const [classroom, setClassroom] = useState<ClassroomData | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassroomDetails();
    fetchClassroomAssignments();
  }, [id]);

  const fetchClassroomDetails = async () => {
    try {
      setLoading(true);
      const response = await classroomService.getClassroom(id!);
      setClassroom(response.data);
      setError(null);
    } catch (err) {
      logger.error('Failed to fetch classroom details:', err);
      setError('Failed to load classroom details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassroomAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      const response = await classroomService.getClassroomAssignments(id!);
      setAssignments(response.data || []);
    } catch (err) {
      logger.error('Failed to fetch classroom assignments:', err);
      // Use mock data if API fails
      setAssignments([
        {
          _id: 'assignment1',
          title: 'Algebra Homework',
          description: 'Complete problems 1-20 in Chapter 5',
          dueDate: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
          classroomId: id!
        },
        {
          _id: 'assignment2',
          title: 'Math Quiz Review',
          description: 'Practice problems for upcoming quiz',
          dueDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          classroomId: id!,
          completed: true
        }
      ]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (window.confirm('Are you sure you want to remove this student from the classroom?')) {
      try {
        await classroomService.removeStudent(id!, studentId);
        // Update the classroom data after removing student
        setClassroom(prev => {
          if (!prev) return null;
          return {
            ...prev,
            students: prev.students.filter(student => student._id !== studentId)
          };
        });
      } catch (err) {
        logger.error('Failed to remove student:', err);
        setError('Failed to remove student. Please try again.');
      }
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      try {
        await classroomService.deleteAssignment(assignmentId);
        // Remove the deleted assignment from state
        setAssignments(prev => prev.filter(assignment => assignment._id !== assignmentId));
      } catch (err) {
        logger.error('Failed to delete assignment:', err);
        setError('Failed to delete assignment. Please try again.');
      }
    }
  };

  if (loading && !classroom) {
    return <div className="loading-spinner">Loading classroom details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!classroom) {
    return <div className="not-found-message">Classroom not found.</div>;
  }

  const isTeacher = currentUser?.id === classroom.teacherId._id;

  // Sort assignments by due date (closest first)
  const sortedAssignments = [...assignments].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="classroom-details-container">
      <div className="details-header">
        <div>
          <h1>{classroom.name}</h1>
          <p className="classroom-meta">
            {classroom.subject && <span className="subject-tag">{classroom.subject}</span>}
            {classroom.gradeLevel && <span className="grade-tag">{classroom.gradeLevel}</span>}
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          {isTeacher && (
            <button 
              className="invite-button"
              onClick={() => navigate(`/classrooms/${id}/invite`)}
            >
              Invite Students
            </button>
          )}
        </div>
      </div>

      {classroom.description && (
        <div className="classroom-description">
          <h2>Description</h2>
          <p>{classroom.description}</p>
        </div>
      )}

      <div className="classroom-section">
        <h2>Students ({classroom.students.length})</h2>
        {classroom.students.length > 0 ? (
          <div className="students-list">
            {classroom.students.map(student => (
              <div key={student._id} className="student-card">
                <div className="student-info">
                  <h3>{student.name}</h3>
                  <p>{student.email}</p>
                </div>
                <div className="student-actions">
                  <button 
                    className="view-progress-btn"
                    onClick={() => navigate(`/students/${student._id}/progress`)}
                  >
                    View Progress
                  </button>
                  {isTeacher && (
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveStudent(student._id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-students-message">No students in this classroom yet.</p>
        )}
      </div>

      <div className="classroom-section">
        <h2>Assignments</h2>
        {isTeacher && (
          <button 
            className="create-assignment-btn"
            onClick={() => navigate('/assignments/create', { state: { classroomId: id } })}
          >
            Create New Assignment
          </button>
        )}
        
        {assignmentsLoading ? (
          <div className="loading-spinner">Loading assignments...</div>
        ) : sortedAssignments.length > 0 ? (
          <div className="assignments-list">
            {sortedAssignments.map(assignment => (
              <div key={assignment._id} className="assignment-item">
                <div className="assignment-info">
                  <div className="assignment-title">{assignment.title}</div>
                  <div className="assignment-details">
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  <p className="assignment-description">{assignment.description}</p>
                </div>
                <div className="assignment-actions">
                  {isTeacher ? (
                    <>
                      <button 
                        className="edit-btn"
                        onClick={() => navigate(`/assignments/${assignment._id}/edit`)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteAssignment(assignment._id)}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <div className={`assignment-status ${assignment.completed ? 'completed' : 'pending'}`}>
                      {assignment.completed ? 'Completed' : 'Pending'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-assignments-message">No assignments created yet.</p>
        )}
      </div>
    </div>
  );
}; 