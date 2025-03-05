import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { wellbeingService } from '../services/api';
import '../styles/Journal.css';
import logger from '../utils/logger';

interface JournalEntry {
  _id: string;
  entryText: string;
  timestamp: string;
  tags?: string[];
}

const Journal: React.FC = () => {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('1month');
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  // Fetch journal entries
  useEffect(() => {
    const fetchEntries = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Pass timeframe parameter to the API
        const response = await wellbeingService.getJournalEntries(timeframe);
        
        // Check if response.data exists and is an array before setting
        if (response && response.data && Array.isArray(response.data)) {
          setEntries(response.data);
        } else if (Array.isArray(response)) {
          // Handle case where response might be the array directly
          setEntries(response);
        } else {
          logger.error('Unexpected response format:', response);
          // Initialize with empty array as fallback
          setEntries([]);
          setError('Received unexpected data format from server');
        }
      } catch (err) {
        logger.error('Error fetching journal entries:', err);
        setError('Failed to load journal entries. Please try again later.');
        // Initialize with empty array on error
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntries();
  }, [currentUser, timeframe]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEntry.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Pass both entryText and tags to the API
      const response = await wellbeingService.addJournalEntry(newEntry, tags);
      
      // Add the new entry to the list with proper type handling
      if (response && response.data) {
        // Ensure the data conforms to the JournalEntry interface
        const newEntry: JournalEntry = {
          _id: response.data._id || 'temp-id-' + Date.now(),
          entryText: response.data.entryText || response.data.content || '',
          timestamp: response.data.timestamp || response.data.date || new Date().toISOString(),
          tags: response.data.tags || []
        };
        
        // Add the new entry to the state array
        setEntries(prevEntries => [newEntry, ...prevEntries]);
      }
      
      // Clear the form
      setNewEntry('');
      setTags([]);
      setNewTag('');
    } catch (err) {
      logger.error('Error saving journal entry:', err);
      setError('Failed to save journal entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a tag
  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) {
      return;
    }
    
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle deleting an entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      return;
    }
    
    setDeletingEntryId(entryId);
    
    try {
      await wellbeingService.deleteJournalEntry(entryId);
      
      // Remove the deleted entry from the list
      setEntries(prevEntries => prevEntries.filter(entry => entry._id !== entryId));
    } catch (err) {
      logger.error('Error deleting journal entry:', err);
      setError('Failed to delete journal entry. Please try again.');
    } finally {
      setDeletingEntryId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="journal-container">
      <div className="journal-header">
        <h1>Study Journal</h1>
        <div className="timeframe-selector">
          <label htmlFor="timeframe">Show entries from: </label>
          <select 
            id="timeframe" 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="1week">Past Week</option>
            <option value="1month">Past Month</option>
            <option value="3months">Past 3 Months</option>
            <option value="6months">Past 6 Months</option>
            <option value="1year">Past Year</option>
          </select>
        </div>
      </div>
      
      <div className="journal-new-entry">
        <h2>New Entry</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Write about your study experience, challenges, or how you're feeling today..."
            rows={5}
            required
          />
          
          <div className="tags-input-container">
            <div className="tags-input">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tags (e.g., math, stress, success)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
            </div>
            
            {tags.length > 0 && (
              <div className="tags-list">
                {tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="submit-entry-button"
            disabled={isLoading || !newEntry.trim()}
          >
            {isLoading ? 'Saving...' : 'Save Entry'}
          </button>
          
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
      
      <div className="journal-entries">
        <h2>Past Entries</h2>
        
        {isLoading && (!entries || entries.length === 0) ? (
          <div className="loading-message">Loading entries...</div>
        ) : (!entries || entries.length === 0) ? (
          <div className="empty-message">No journal entries yet. Start writing to track your study journey!</div>
        ) : (
          <div className="entries-list">
            {entries.map(entry => (
              <div key={entry._id} className="journal-entry">
                <div className="entry-header">
                  <span className="entry-date">{formatDate(entry.timestamp)}</span>
                  <button 
                    className="delete-entry-button"
                    onClick={() => handleDeleteEntry(entry._id)}
                    disabled={deletingEntryId === entry._id}
                  >
                    {deletingEntryId === entry._id ? 'Deleting...' : 'Delete'}
                  </button>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="entry-tags">
                      {entry.tags.map(tag => (
                        <span key={tag} className="entry-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="entry-content">
                  {entry.entryText.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal; 