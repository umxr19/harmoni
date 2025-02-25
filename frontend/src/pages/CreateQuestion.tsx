import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../services/api';
import { Question } from '../types';

export const CreateQuestion: React.FC = () => {
    const navigate = useNavigate();
    const [questionData, setQuestionData] = useState<Partial<Question>>({
        title: '',
        content: '',
        options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
        category: [],
        difficulty: 'medium'
    });
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await teacherService.createQuestion(questionData);
            navigate('/questions'); // Redirect after successful creation
        } catch (error) {
            setError('Failed to create question.');
            console.error('Error creating question:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create New Question</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label>Title:</label>
                <input
                    type="text"
                    value={questionData.title}
                    onChange={(e) => setQuestionData({ ...questionData, title: e.target.value })}
                />
            </div>
            <div>
                <label>Content:</label>
                <textarea
                    value={questionData.content}
                    onChange={(e) => setQuestionData({ ...questionData, content: e.target.value })}
                />
            </div>
            {/* Add fields for options, category, and difficulty */}
            <button type="submit">Create Question</button>
        </form>
    );
}; 