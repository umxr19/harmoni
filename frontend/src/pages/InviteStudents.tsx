import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classroomService } from '../services/api';
import '../styles/InviteStudents.css';
import logger from '../utils/logger';

interface Classroom {
  _id: string;
  name: string;
}

export const InviteStudents: React.FC = () => {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        setLoading(true);
        const response = await classroomService.getClassroom(classroomId!);
        setClassroom(response.data);
      } catch (err) {
        logger.error('Failed to fetch classroom:', err);
        setError('Failed to load classroom information.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassroom();
  }, [classroomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emails.trim()) {
      setError('Please enter at least one email address.');
      return;
    }

    try {
      setSending(true);
      setError(null);
      setSuccess(null);
      
      const emailList = emails.split(',').map(email => email.trim());
      
      await classroomService.inviteStudents(classroomId!, {
        emails: emailList,
        message: message.trim()
      });
      
      setSuccess('Invitations sent successfully!');
      setEmails('');
      setMessage('');
    } catch (err) {
      logger.error('Failed to send invitations:', err);
      setError('Failed to send invitations. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!classroom) {
    return <div className="error-message">Classroom not found.</div>;
  }

  return (
    <div className="invite-students-container">
      <div className="invite-header">
        <h1>Invite Students to {classroom.name}</h1>
        <button 
          className="back-button"
          onClick={() => navigate(`/classrooms/${classroomId}`)}
        >
          Back to Classroom
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="invite-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="emails">Student Email Addresses</label>
            <textarea
              id="emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Enter email addresses separated by commas"
              rows={5}
              required
            />
            <small>Enter multiple email addresses separated by commas.</small>
          </div>

          <div className="form-group">
            <label htmlFor="message">Invitation Message (Optional)</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to your invitation"
              rows={4}
            />
          </div>

          <button 
            type="submit" 
            className="send-invites-button"
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send Invitations'}
          </button>
        </form>
      </div>

      <div className="invite-info">
        <h3>What happens next?</h3>
        <ul>
          <li>Students will receive an email invitation to join your classroom.</li>
          <li>If they already have an account, they can accept the invitation to join.</li>
          <li>If they don't have an account, they'll be prompted to create one.</li>
          <li>You'll be notified when students accept your invitation.</li>
        </ul>
      </div>
    </div>
  );
}; 