import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionService } from '../services/api';
import { Question } from '../types';
import logger from '../utils/logger';

export const EditQuestion: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [question, setQuestion] = useState<Question | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const response = await questionService.getQuestionById(id!);
                setQuestion(response.data);
            } catch (error) {
                setError('Failed to fetch question.');
                logger.error('Error fetching question:', error);
            }
        };

        fetchQuestion();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (question) {
            try {
                await questionService.updateQuestion(id!, question);
                navigate('/questions');
            } catch (error) {
                setError('Failed to update question.');
                logger.error('Error updating question:', error);
            }
        }
    };

    if (!question) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <form onSubmit={handleSubmit}>
            <h2>Edit Question</h2>
            <div>
                <label>Title:</label>
                <input
                    type="text"
                    value={question.title}
                    onChange={(e) => setQuestion({ ...question, title: e.target.value })}
                />
            </div>
            <div>
                <label>Content:</label>
                <textarea
                    value={question.content}
                    onChange={(e) => setQuestion({ ...question, content: e.target.value })}
                />
            </div>
            {/* Add fields for options, category, and difficulty */}
            <button type="submit">Update Question</button>
        </form>
    );
}; 