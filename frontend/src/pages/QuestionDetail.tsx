import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { questionService } from '../services/api';
import { Question } from '../types';

export const QuestionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [question, setQuestion] = useState<Question | null>(null);
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const response = await questionService.getQuestionById(id!);
                setQuestion(response.data);
            } catch (error) {
                setError('Failed to fetch question.');
                console.error('Error fetching question:', error);
            }
        };

        fetchQuestion();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (question) {
            try {
                // Assuming you have a submitAttempt method in your questionService
                await questionService.submitAttempt(question._id, selectedOption, 0); // Replace 0 with actual time spent
                // Handle success (e.g., show a success message or redirect)
            } catch (error) {
                setError('Failed to submit answer.');
                console.error('Error submitting answer:', error);
            }
        }
    };

    if (!question) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>{question.title}</h2>
            <p>{question.content}</p>
            <form onSubmit={handleSubmit}>
                {question.options.map((option, index) => (
                    <label key={index}>
                        <input
                            type="radio"
                            name="answer"
                            value={option.text}
                            onChange={(e) => setSelectedOption(e.target.value)}
                        />
                        {option.text}
                    </label>
                ))}
                <button type="submit">Submit Answer</button>
            </form>
        </div>
    );
}; 