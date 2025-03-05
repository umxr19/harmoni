const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock data
const classrooms = [
  {
    _id: '1',
    name: 'Math 101',
    description: 'Introduction to Mathematics',
    gradeLevel: 'high',
    subject: 'Mathematics',
    teacherId: '123456',
    studentCount: 15,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'English Literature',
    description: 'Classic literature studies',
    gradeLevel: 'high',
    subject: 'English',
    teacherId: '123456',
    studentCount: 12,
    createdAt: new Date().toISOString()
  }
];

const questions = [
  {
    _id: 'q1',
    text: 'What is 7 × 8?',
    question: 'What is 7 × 8?',
    category: ['Mathematics', 'Arithmetic'],
    difficulty: 'easy',
    options: [
      { text: '54', isCorrect: false },
      { text: '56', isCorrect: true },
      { text: '58', isCorrect: false },
      { text: '62', isCorrect: false }
    ],
    createdBy: { _id: '123456', username: 'Teacher' }
  },
  {
    _id: 'q2',
    text: 'Who wrote "Romeo and Juliet"?',
    question: 'Who wrote "Romeo and Juliet"?',
    category: ['English', 'Literature'],
    difficulty: 'medium',
    options: [
      { text: 'Charles Dickens', isCorrect: false },
      { text: 'William Shakespeare', isCorrect: true },
      { text: 'Jane Austen', isCorrect: false },
      { text: 'Mark Twain', isCorrect: false }
    ],
    createdBy: { _id: '123456', username: 'Teacher' }
  }
];

// API Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Mock API is running!' });
});

// Get teacher classrooms
app.get('/api/classrooms/teacher', (req, res) => {
  res.json(classrooms);
});

// Get a single classroom
app.get('/api/classrooms/:id', (req, res) => {
  const classroom = classrooms.find(c => c._id === req.params.id);
  if (classroom) {
    res.json(classroom);
  } else {
    res.status(404).json({ message: 'Classroom not found' });
  }
});

// Get questions
app.get('/api/questions', (req, res) => {
  res.json(questions);
});

// Get question stats
app.get('/api/questions/:id/stats', (req, res) => {
  res.json({
    attempts: Math.floor(Math.random() * 100) + 50,
    correctRate: Math.floor(Math.random() * 40) + 60,
    averageTime: Math.floor(Math.random() * 30) + 20,
    successRate: Math.floor(Math.random() * 40) + 60
  });
});

// Create a new classroom
app.post('/api/classrooms', (req, res) => {
  const { name, description, gradeLevel, subject } = req.body;
  
  const newClassroom = {
    _id: Date.now().toString(),
    name,
    description,
    gradeLevel,
    subject,
    teacherId: '123456',
    students: [],
    createdAt: new Date().toISOString()
  };
  
  classrooms.push(newClassroom);
  
  res.status(201).json(newClassroom);
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  res.json({
    token: 'mock-jwt-token',
    user: {
      id: '123456',
      username: 'testuser',
      email: 'test@example.com',
      role: 'teacher'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    token: 'mock-jwt-token',
    user: {
      id: '123456',
      username: req.body.username,
      email: req.body.email,
      role: 'student'
    }
  });
});

// Parent routes
app.get('/api/progress/parent/children', (req, res) => {
  res.json([
    {
      id: 'child1',
      name: 'John Doe',
      email: 'john@example.com',
      lastActive: new Date().toISOString()
    },
    {
      id: 'child2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      lastActive: new Date().toISOString()
    }
  ]);
});

app.get('/api/progress/parent/child/:childId/stats', (req, res) => {
  res.json({
    totalQuestions: 120,
    questionsAttempted: 85,
    correctAnswers: 65,
    accuracy: 76.5,
    averageTime: 45,
    recentScore: 82
  });
});

app.get('/api/progress/parent/child/:childId/activity', (req, res) => {
  res.json([
    {
      date: new Date().toISOString(),
      activity: 'Completed Math Practice',
      score: 85,
      timeSpent: 25
    },
    {
      date: new Date(Date.now() - 86400000).toISOString(),
      activity: 'Attempted Verbal Reasoning Exam',
      score: 72,
      timeSpent: 45
    }
  ]);
});

// Exam routes
app.get('/api/exams/public', (req, res) => {
  res.json([
    {
      _id: 'e1',
      title: 'Math Exam',
      description: 'Test your math skills',
      duration: 60,
      category: ['Mathematics'],
      difficulty: 'medium',
      createdBy: { username: 'Admin' },
      questionCount: 20
    },
    {
      _id: 'e2',
      title: 'English Exam',
      description: 'Test your English skills',
      duration: 45,
      category: ['English'],
      difficulty: 'easy',
      createdBy: { username: 'Admin' },
      questionCount: 15
    }
  ]);
});

app.post('/api/exams/create-samples', (req, res) => {
  res.json({ message: 'Sample exams created successfully' });
});

app.get('/api/exams/:id/results/:attemptId', (req, res) => {
  res.json({
    examId: req.params.id,
    examTitle: 'Sample Exam',
    score: 85,
    totalQuestions: 20,
    percentageScore: 85,
    timeTaken: 35,
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date().toISOString(),
    answers: []
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
}); 