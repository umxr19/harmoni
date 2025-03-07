export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
}

export interface Question {
  _id: string;
  title: string;
  content: string;
  category: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  options: string[];
  correctAnswer: string;
  explanation: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  _id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
  totalQuestions: number;
  difficulty: string;
  duration: number;
  createdBy: User;
  isPublic: boolean;
  createdAt: string;
}

export interface StudySchedulePreferences {
  preferredStudyTime: 'morning' | 'afternoon' | 'evening';
  preferredRestDay: number;
  maxDailyHours: number;
  focusAreas: string[];
}

export interface ScheduleDay {
  day: string;
  date: string;
  isRestDay: boolean;
  topics: Array<{
    subject: string;
    duration: string;
    focus: string;
  }>;
  totalDuration: string;
  completed: boolean;
  motivationalMessage: string;
}

export interface WeeklySchedule {
  week: number;
  startDate: string;
  endDate: string;
  days: ScheduleDay[];
  restDayIndex: number;
  averageMood: number;
  userId: string;
}

export interface APIResponse<T> {
  data: T;
  usingMockData?: boolean;
  status?: number;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  totalPages: number;
  currentPage: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MoodRating {
  _id: string;
  userId: string;
  moodValue: number;
  notes?: string;
  timestamp: string;
}

export interface JournalEntry {
  _id: string;
  userId: string;
  entryText: string;
  tags: string[];
  sentiment: number;
  createdAt: string;
}

export interface ProgressStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  timeSpent: number;
  categoryData: {
    category: string;
    correct: number;
    total: number;
  }[];
  strengthAreas: string[];
  weakAreas: string[];
}

export interface ActivityRecord {
  _id: string;
  userId: string;
  type: 'question' | 'exam' | 'practice';
  itemId: string;
  result: boolean;
  timeSpent: number;
  createdAt: string;
}

export interface ProgressChartsProps {
  categoryData: Array<{ category: string; correct: number; total: number }>;
  timeData: Array<{ date: string; correct: number; total: number }>;
  questionsByCategory: Array<{ category: string; count: number }>;
  timeframe: string;
}

export interface QuestionInput {
    questionText: string;
    options: string[];
    correctAnswer: string;
}