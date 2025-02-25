import React, { useEffect, useState } from 'react';
import { Question } from '../types';
import { questionService } from '../services/api';

export const QuestionList: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await questionService.getQuestions();
                setQuestions(response.data);
            } catch (error) {
                setError('Failed to fetch questions.');
                console.error('Failed to fetch questions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Questions</h2>
            <div className="question-list">
                {questions.map(question => (
                    <div key={question._id} className="question-card">
                        <h3>{question.title}</h3>
                        <p>Difficulty: {question.difficulty}</p>
                        <p>Categories: {question.category.join(', ')}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}; 