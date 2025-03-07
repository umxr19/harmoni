import { User, Question, Exam, WeeklySchedule, StudySchedulePreferences, ScheduleDay } from '../types';

const mockAdmin: User = {
  _id: 'admin123',
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin'
};

const mockQuestions: Question[] = [
  {
    _id: '1',
    title: 'Sample Question 1',
    content: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    category: ['Math', 'Basic Arithmetic'],
    difficulty: 'easy',
    explanation: 'Basic addition',
    createdBy: mockAdmin,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // ... other questions ...
];

const mockExams: Exam[] = [
  {
    _id: '1',
    title: 'Basic Math Test',
    description: 'Test your basic math skills',
    category: 'Mathematics',
    questions: mockQuestions.slice(0, 5),
    totalQuestions: 5,
    difficulty: 'easy',
    duration: 30,
    createdBy: mockAdmin,
    isPublic: true,
    createdAt: new Date().toISOString()
  },
  // ... other exams ...
];

const mockSchedule: WeeklySchedule = {
  week: 1,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  days: [
    {
      day: 'Monday',
      date: new Date().toISOString(),
      isRestDay: false,
      topics: [
        {
          subject: 'Math',
          duration: '1 hour',
          focus: 'Basic arithmetic'
        }
      ],
      totalDuration: '1 hour',
      completed: false,
      motivationalMessage: 'You can do it!'
    }
  ],
  restDayIndex: 6,
  averageMood: 0,
  userId: 'user123'
};

export const mockApi = {
  saveSchedulePreferences: (preferences: StudySchedulePreferences): Promise<WeeklySchedule> => {
    return Promise.resolve(mockSchedule);
  },

  getWeeklySchedule: (): Promise<WeeklySchedule> => {
    return Promise.resolve(mockSchedule);
  },

  markDayCompleted: (date: string, mood?: number): Promise<WeeklySchedule> => {
    const updated = { ...mockSchedule };
    updated.days = updated.days.map(day => {
      if (day.date === date) {
        return { ...day, completed: true };
      }
      return day;
    });
    if (mood !== undefined) {
      updated.averageMood = mood;
    }
    return Promise.resolve(updated);
  },

  generateWeeklySchedule: (preferences: StudySchedulePreferences | null): Promise<WeeklySchedule> => {
    return Promise.resolve(mockSchedule);
  },

  updateScheduleDay: (date: string, updates: Partial<ScheduleDay>): Promise<WeeklySchedule> => {
    const updated = { ...mockSchedule };
    updated.days = updated.days.map(day => {
      if (day.date === date) {
        return { ...day, ...updates };
      }
      return day;
    });
    return Promise.resolve(updated);
  }
}; 