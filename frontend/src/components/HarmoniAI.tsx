import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/HarmoniAI.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const HarmoniAI: React.FC = () => {
  const { currentUser, getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch('/api/openai/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: userMessage.content,
          context: 'student question'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get response');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content
      }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return null; // Don't show the chatbot for unauthenticated users
  }

  return (
    <>
      {/* Floating Action Button */}
      <button 
        className={`harmoni-ai-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open HarmoniAI Chat"
      >
        {isOpen ? '×' : '🤖'}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="harmoni-ai-chat">
          <div className="harmoni-ai-header">
            <h3>HarmoniAI Tutor</h3>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          
          <div className="harmoni-ai-messages">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <h4>👋 Hello! I'm HarmoniAI</h4>
                <p>I'm here to help you with your studies. Ask me anything!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`message ${message.role}`}
                >
                  {message.content}
                </div>
              ))
            )}
            {isLoading && (
              <div className="message assistant loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="harmoni-ai-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default HarmoniAI; 