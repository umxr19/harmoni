import React, { useState } from 'react';

interface QuestionProps {
    question: {
        title: string;
        content: string;
        options: Array<{
            text: string;
            isCorrect: boolean;
        }>;
    };
    onSubmit: (answer: string, timeSpent: number) => void;
}

export const Question: React.FC<QuestionProps> = ({ question, onSubmit }) => {
    const [selectedOption, setSelectedOption] = useState('');
    const [startTime] = useState(Date.now());

    const handleSubmit = () => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        onSubmit(selectedOption, timeSpent);
    };

    return (
        <div className="question-container">
            <h2>{question.title}</h2>
            <p>{question.content}</p>
            <div className="options">
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
            </div>
            <button onClick={handleSubmit}>Submit Answer</button>
        </div>
    );
}; 