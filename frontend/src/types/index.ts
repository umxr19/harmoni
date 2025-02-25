export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
}

export interface Question {
    _id: string;
    title: string;
    content: string;
    options: Array<{
        text: string;
        isCorrect: boolean;
    }>;
    category: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    createdBy: string;
}

export interface Attempt {
    _id: string;
    user: string;
    question: string;
    selectedOption: string;
    isCorrect: boolean;
    timeSpent: number;
    createdAt: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    role: 'student' | 'teacher';
} 