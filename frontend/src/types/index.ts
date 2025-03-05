export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    userType?: 'parent' | 'child';
    yearGroup?: number;
    avatarUrl?: string;
    isEmailVerified: boolean;
    notificationPreferences?: {
        emailNotifications: boolean;
        studyReminders: boolean;
    };
    createdAt: string;
}

export interface Question {
    _id: string;
    question: string;
    category: string[];
    subCategory?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    options: Array<{
        text: string;
        isCorrect: boolean;
    }>;
    explanation?: string;
    imageUrl?: string;
    createdBy: {
        _id: string;
        username: string;
    };
    createdAt: string;
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

export interface PracticeSet {
    _id: string;
    name: string;
    description: string;
    questions: string[];
    category: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    createdBy: {
        _id: string;
        username: string;
    };
    isPublic: boolean;
    createdAt: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    role: 'student' | 'teacher';
}

export interface UserStats {
    totalAttempts: number;
    correctAnswers: number;
    accuracy: number;
    averageTime: number;
    categoryPerformance: {
        category: string;
        accuracy: number;
        questionsAttempted: number;
    }[];
    recentActivity: {
        date: string;
        questionsAttempted: number;
        correctAnswers: number;
    }[];
}

export interface QuestionStats {
    totalAttempts: number;
    correctAttempts: number;
    averageTime: number;
    successRate: number;
}

export interface PracticeResult {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    averageTime: number;
    categoryPerformance: {
        category: string;
        accuracy: number;
    }[];
}

export interface Exam {
    _id: string;
    title: string;
    description: string;
    duration: number;
    questions: string[];
    category: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    createdBy: {
        _id: string;
        username: string;
    };
    isPublic: boolean;
    createdAt: string;
}

export interface ExamAttempt {
    _id: string;
    user: string;
    exam: Exam;
    startTime: string;
    endTime?: string;
    isCompleted: boolean;
    answers: {
        question: Question;
        selectedOption: string;
        isCorrect: boolean;
        timeSpent: number;
        flagged: boolean;
    }[];
    score: number;
    totalQuestions: number;
    timeSpent: number;
}

export interface ExamResults {
    examTitle: string;
    examDuration: number;
    startTime: string;
    endTime: string;
    timeSpent: number;
    score: number;
    totalQuestions: number;
    accuracy: number;
    categoryPerformance: {
        category: string;
        accuracy: number;
        questionsAttempted: number;
    }[];
    incorrectAnswers: {
        question: string;
        selectedOption: string;
        correctOption: string;
        explanation?: string;
    }[];
    previousAttempts: {
        date: string;
        score: number;
        totalQuestions: number;
        timeSpent: number;
    }[];
}

export interface StudyTopic {
    id: string;
    name: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    description?: string;
    recommendedDuration: number; // in minutes
    userPerformance?: number; // percentage score (0-100)
}

export interface DailySchedule {
    day: string;
    date: string;
    isRestDay: boolean;
    topics: StudyTopic[];
    totalDuration: number; // in minutes
    completed: boolean;
    mood?: number; // 1-5 scale
    motivationalMessage?: string;
}

export interface WeeklySchedule {
    week: number;
    startDate: string;
    endDate: string;
    days: DailySchedule[];
    restDayIndex: number;
    averageMood?: number;
    userId: string;
}

export interface StudySchedulePreferences {
    preferredRestDay?: number; // 0-6 (Sunday-Saturday)
    preferredStudyTime?: string; // HH:MM format
    preferredTopics?: string[]; // Topic IDs
    excludedTopics?: string[]; // Topic IDs
    studyDuration?: number; // in minutes, default 60
    userId: string;
}

export interface Subject {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    yearGroups: number[]; // Array of year groups where this subject is applicable
    categories: string[]; // Subject categories/topics
    isGCSE?: boolean;
    isALevel?: boolean;
    is11Plus?: boolean;
    color?: string; // For UI styling
} 