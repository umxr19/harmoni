export interface Question {
    id: number;
    questionText: string;
    options: string[];
    correctAnswer: string;
}

export interface QuestionInput {
    questionText: string;
    options: string[];
    correctAnswer: string;
}