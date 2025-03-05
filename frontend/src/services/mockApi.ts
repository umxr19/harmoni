import { Question, Exam, User } from '../types';
import { Product } from './productService';

// Define the Purchase interface here to avoid circular dependency
export interface Purchase {
  _id: string;
  user: { _id: string; username: string };
  product: Product;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  accessExpires: string;
  downloadCount: number;
  lastDownloaded: string | null;
  createdAt: string;
  updatedAt: string;
}

// Mock delay to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock products data
const mockProducts: Product[] = [
  {
    _id: 'prod1',
    title: '11+ Mathematics Practice Workbook',
    description: 'A comprehensive workbook with 200+ practice questions covering all key mathematics topics for the 11+ exam. Includes detailed solutions and explanations.',
    price: 12.99,
    category: '11+ Maths',
    coverImage: 'https://images.unsplash.com/photo-1635372722656-389f87a941db?q=80&w=500&auto=format&fit=crop',
    previewUrl: null,
    featured: true,
    publishedDate: new Date(2023, 5, 15).toISOString(),
    isActive: true,
    stripeProductId: 'mock_stripe_prod_1',
    stripePriceId: 'mock_stripe_price_1',
    createdAt: new Date(2023, 5, 10).toISOString(),
    updatedAt: new Date(2023, 5, 10).toISOString()
  },
  {
    _id: 'prod2',
    title: '11+ English Comprehension Guide',
    description: 'Master comprehension skills with this comprehensive guide featuring 150+ practice passages and questions with detailed explanations and marking schemes.',
    price: 14.99,
    category: '11+ English',
    coverImage: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=500&auto=format&fit=crop',
    previewUrl: null,
    featured: true,
    publishedDate: new Date(2023, 6, 20).toISOString(),
    isActive: true,
    stripeProductId: 'mock_stripe_prod_2',
    stripePriceId: 'mock_stripe_price_2',
    createdAt: new Date(2023, 6, 15).toISOString(),
    updatedAt: new Date(2023, 6, 15).toISOString()
  },
  {
    _id: 'prod3',
    title: '11+ Verbal Reasoning Techniques',
    description: 'Learn essential techniques and strategies for solving all types of verbal reasoning questions. Includes 300+ practice questions with step-by-step solutions.',
    price: 15.99,
    category: '11+ Verbal Reasoning',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=500&auto=format&fit=crop',
    previewUrl: null,
    featured: false,
    publishedDate: new Date(2023, 7, 5).toISOString(),
    isActive: true,
    stripeProductId: 'mock_stripe_prod_3',
    stripePriceId: 'mock_stripe_price_3',
    createdAt: new Date(2023, 7, 1).toISOString(),
    updatedAt: new Date(2023, 7, 1).toISOString()
  },
  {
    _id: 'prod4',
    title: '11+ Non-verbal Reasoning Mastery',
    description: 'A complete guide to mastering non-verbal reasoning with detailed explanations of all question types and 250+ practice questions with solutions.',
    price: 13.99,
    category: '11+ Non-verbal Reasoning',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=500&auto=format&fit=crop',
    previewUrl: null,
    featured: false,
    publishedDate: new Date(2023, 8, 10).toISOString(),
    isActive: true,
    stripeProductId: 'mock_stripe_prod_4',
    stripePriceId: 'mock_stripe_price_4',
    createdAt: new Date(2023, 8, 5).toISOString(),
    updatedAt: new Date(2023, 8, 5).toISOString()
  },
  {
    _id: 'prod5',
    title: 'Complete 11+ Study Planner',
    description: 'An essential planning tool for 11+ exam preparation. Includes weekly study schedules, progress trackers, and tips for effective revision.',
    price: 9.99,
    category: 'General',
    coverImage: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=500&auto=format&fit=crop',
    previewUrl: null,
    featured: true,
    publishedDate: new Date(2023, 9, 1).toISOString(),
    isActive: true,
    stripeProductId: 'mock_stripe_prod_5',
    stripePriceId: 'mock_stripe_price_5',
    createdAt: new Date(2023, 8, 25).toISOString(),
    updatedAt: new Date(2023, 8, 25).toISOString()
  },
  {
    _id: 'prod6',
    title: '11+ Mock Exam Pack',
    description: 'A set of 5 complete mock exams covering all subjects with realistic exam conditions and detailed marking schemes.',
    price: 19.99,
    category: 'General',
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=500&auto=format&fit=crop',
    previewUrl: null,
    featured: false,
    publishedDate: new Date(2023, 10, 15).toISOString(),
    isActive: true,
    stripeProductId: 'mock_stripe_prod_6',
    stripePriceId: 'mock_stripe_price_6',
    createdAt: new Date(2023, 10, 10).toISOString(),
    updatedAt: new Date(2023, 10, 10).toISOString()
  }
];

// Mock user purchases
const mockPurchases: Purchase[] = [
  {
    _id: 'purchase1',
    user: { _id: 'user1', username: 'testuser' },
    product: mockProducts[0],
    stripeSessionId: 'mock_session_1',
    stripePaymentIntentId: 'mock_payment_1',
    amount: mockProducts[0].price,
    currency: 'GBP',
    status: 'completed',
    accessExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    downloadCount: 2,
    lastDownloaded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'purchase2',
    user: { _id: 'user1', username: 'testuser' },
    product: mockProducts[1],
    stripeSessionId: 'mock_session_2',
    stripePaymentIntentId: 'mock_payment_2',
    amount: mockProducts[1].price,
    currency: 'GBP',
    status: 'completed',
    accessExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    downloadCount: 1,
    lastDownloaded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock questions data
const mockQuestions: Question[] = [
  {
    _id: 'q1',
    question: 'What is 7 × 8?',
    options: [
      { text: '54', isCorrect: false },
      { text: '56', isCorrect: true },
      { text: '58', isCorrect: false },
      { text: '62', isCorrect: false }
    ],
    explanation: '7 × 8 = 56',
    category: ['Mathematics'],
    difficulty: 'easy',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'q2',
    question: 'Which word is a synonym for "happy"?',
    options: [
      { text: 'Sad', isCorrect: false },
      { text: 'Angry', isCorrect: false },
      { text: 'Joyful', isCorrect: true },
      { text: 'Tired', isCorrect: false }
    ],
    explanation: 'Joyful means feeling or expressing great pleasure and happiness.',
    category: ['Verbal Reasoning'],
    difficulty: 'easy',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Add more mock questions as needed
];

// Mock exams data
const mockExams: Exam[] = [
  {
    _id: 'exam1',
    title: '11+ Mathematics Practice Exam',
    description: 'A comprehensive mathematics exam covering all key topics for the 11+ exam.',
    duration: 60,
    questions: mockQuestions.filter(q => q.category.includes('Mathematics')).map(q => q._id),
    category: ['Mathematics'],
    difficulty: 'medium',
    isPublic: true,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'exam2',
    title: '11+ Verbal Reasoning Test',
    description: 'Test your verbal reasoning skills with this practice exam.',
    duration: 45,
    questions: mockQuestions.filter(q => q.category.includes('Verbal Reasoning')).map(q => q._id),
    category: ['Verbal Reasoning'],
    difficulty: 'medium',
    isPublic: true,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'exam3',
    title: 'Mixed 11+ Practice Test',
    description: 'A mixed test covering various topics from the 11+ curriculum.',
    duration: 90,
    questions: mockQuestions.map(q => q._id),
    category: ['Mathematics', 'Verbal Reasoning', 'Non-verbal Reasoning'],
    difficulty: 'hard',
    isPublic: true,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock practice stats
const mockPracticeStats = {
  totalSets: 12,
  questionsAnswered: 120,
  correctAnswers: 98,
  averageScore: 82,
  recentSets: [
    {
      _id: 'set1',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      score: 8,
      totalQuestions: 10,
      category: 'Mathematics'
    },
    {
      _id: 'set2',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      score: 9,
      totalQuestions: 10,
      category: 'Verbal Reasoning'
    },
    {
      _id: 'set3',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      score: 7,
      totalQuestions: 10,
      category: 'Mixed'
    }
  ]
};

// Mock exam stats
const mockExamStats = {
  totalExams: 3,
  examsCompleted: 2,
  averageScore: 78,
  recentExams: [
    {
      _id: 'attempt1',
      examId: 'exam1',
      examTitle: '11+ Mathematics Practice Exam',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      score: 16,
      totalQuestions: 20
    },
    {
      _id: 'attempt2',
      examId: 'exam2',
      examTitle: '11+ Verbal Reasoning Test',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      score: 14,
      totalQuestions: 20
    }
  ]
};

// Mock categories
const mockCategories = [
  { name: 'Mathematics', count: 10 },
  { name: 'Verbal Reasoning', count: 15 },
  { name: 'Non-verbal Reasoning', count: 8 },
  { name: 'English', count: 12 }
];

// Mock practice service
export const mockPracticeService = {
  createPracticeSet: async (options: { category?: string; questionCount: number }) => {
    await delay(800);
    return {
      data: {
        _id: 'new-practice-set-' + Date.now(),
        questions: mockQuestions.slice(0, options.questionCount),
        category: options.category || 'Mixed',
        createdAt: new Date().toISOString()
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getPracticeSet: async (setId: string) => {
    await delay(500);
    return {
      data: {
        _id: setId,
        questions: mockQuestions.slice(0, 10),
        category: 'Mixed',
        createdAt: new Date().toISOString()
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  submitPracticeAnswer: async (setId: string, questionId: string, answer: string) => {
    await delay(300);
    const question = mockQuestions.find(q => q._id === questionId);
    const isCorrect = question?.options.find(o => o.text === answer)?.isCorrect || false;
    
    return {
      data: {
        isCorrect,
        explanation: question?.explanation
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  completePracticeSet: async (setId: string) => {
    await delay(800);
    return {
      data: {
        _id: setId,
        score: 8,
        totalQuestions: 10,
        percentageScore: 80,
        timeTaken: 450,
        category: 'Mixed',
        completedAt: new Date().toISOString()
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getPracticeResults: async (setId: string) => {
    await delay(600);
    return {
      data: {
        _id: setId,
        score: 8,
        totalQuestions: 10,
        percentageScore: 80,
        timeTaken: 450,
        category: 'Mixed',
        completedAt: new Date().toISOString(),
        answers: mockQuestions.slice(0, 10).map(q => ({
          question: q,
          selectedOption: q.options[Math.floor(Math.random() * 4)].text,
          isCorrect: Math.random() > 0.2,
          timeSpent: Math.floor(Math.random() * 60) + 20
        }))
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getUserPracticeSets: async (page = 1, limit = 10) => {
    await delay(500);
    return {
      data: {
        sets: mockPracticeStats.recentSets,
        total: mockPracticeStats.totalSets,
        page,
        limit
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getUserStats: async () => {
    await delay(700);
    return {
      data: mockPracticeStats,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  }
};

// Mock exam service
export const mockExamService = {
  getExams: async (page = 1, limit = 10) => {
    await delay(800);
    return {
      data: mockExams,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getPublicExams: async (page = 1, limit = 10) => {
    await delay(800);
    return {
      data: mockExams.filter(e => e.isPublic),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getExamById: async (examId: string) => {
    await delay(500);
    const exam = mockExams.find(e => e._id === examId);
    if (!exam) {
      throw new Error('Exam not found');
    }
    return {
      data: exam,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  startExam: async (examId: string) => {
    await delay(1000);
    const exam = mockExams.find(e => e._id === examId);
    if (!exam) {
      throw new Error('Exam not found');
    }
    
    return {
      data: {
        _id: 'attempt-' + Date.now(),
        exam: exam,
        questions: mockQuestions.slice(0, exam.questions.length),
        startTime: new Date().toISOString(),
        answers: [],
        status: 'in-progress'
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getExamAttempt: async (attemptId: string) => {
    await delay(600);
    const exam = mockExams[0];
    return {
      data: {
        _id: attemptId,
        exam: exam,
        questions: mockQuestions.slice(0, exam.questions.length),
        startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        answers: mockQuestions.slice(0, exam.questions.length).map(q => ({
          questionId: q._id,
          selectedOption: '',
          timeSpent: 0,
          flagged: false
        })),
        status: 'in-progress'
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  submitExamAnswer: async (attemptId: string, questionId: string, answer: string) => {
    await delay(300);
    return {
      data: {
        success: true
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  completeExamAttempt: async (attemptId: string) => {
    await delay(1000);
    return {
      data: {
        _id: attemptId,
        score: 16,
        totalQuestions: 20,
        percentageScore: 80,
        timeTaken: 3250,
        completedAt: new Date().toISOString()
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getExamResults: async (attemptId: string) => {
    await delay(800);
    return {
      data: {
        examId: 'exam1',
        examTitle: '11+ Mathematics Practice Exam',
        score: 16,
        totalQuestions: 20,
        percentageScore: 80,
        timeTaken: 3250,
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 60 * 60 * 1000 + 3250 * 1000).toISOString(),
        answers: mockQuestions.slice(0, 20).map(q => ({
          question: q,
          selectedOption: q.options[Math.floor(Math.random() * 4)].text,
          isCorrect: Math.random() > 0.2,
          timeSpent: Math.floor(Math.random() * 60) + 20
        })),
        categoryBreakdown: [
          { category: 'Mathematics', correct: 8, total: 10, percentage: 80 },
          { category: 'Verbal Reasoning', correct: 8, total: 10, percentage: 80 }
        ],
        difficultyBreakdown: [
          { difficulty: 'easy', correct: 6, total: 7, percentage: 85.7 },
          { difficulty: 'medium', correct: 7, total: 9, percentage: 77.8 },
          { difficulty: 'hard', correct: 3, total: 4, percentage: 75 }
        ]
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getUserExamAttempts: async (page = 1, limit = 10) => {
    await delay(600);
    return {
      data: {
        attempts: mockExamStats.recentExams,
        total: mockExamStats.examsCompleted,
        page,
        limit
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getUserStats: async () => {
    await delay(700);
    return {
      data: mockExamStats,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  }
};

// Mock question service
export const mockQuestionService = {
  getQuestions: async (page = 1, limit = 10) => {
    await delay(800);
    return {
      data: mockQuestions.slice(0, limit),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getQuestionsByCategory: async (category: string, page = 1, limit = 10) => {
    await delay(700);
    const filteredQuestions = mockQuestions.filter(q => q.category.includes(category));
    return {
      data: filteredQuestions.slice(0, limit),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getQuestionById: async (id: string) => {
    await delay(500);
    const question = mockQuestions.find(q => q._id === id);
    if (!question) {
      throw new Error('Question not found');
    }
    return {
      data: question,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getCategories: async () => {
    await delay(600);
    return {
      data: mockCategories,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getRandomQuestions: async (count: number, category?: string) => {
    await delay(800);
    let questions = [...mockQuestions];
    if (category) {
      questions = questions.filter(q => q.category.includes(category));
    }
    // Shuffle and take 'count' questions
    questions = questions.sort(() => 0.5 - Math.random()).slice(0, count);
    return {
      data: questions,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getQuestion: async (id: string) => {
    await delay(500);
    const question = mockQuestions.find(q => q._id === id);
    if (!question) {
      throw new Error('Question not found');
    }
    return {
      data: question,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getQuestionStats: async (questionId: string) => {
    await delay(400);
    return {
      data: {
        attempts: Math.floor(Math.random() * 100) + 50,
        correctRate: Math.floor(Math.random() * 40) + 60
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getPracticeSet: async (setId: string) => {
    await delay(800);
    return {
      data: mockQuestions.slice(0, 10),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  getRandomPractice: async (count = 10, category?: string) => {
    await delay(800);
    return mockQuestionService.getRandomQuestions(count, category);
  }
};

// Mock product service
export const mockProductService = {
  getProducts: async (params?: { category?: string; featured?: boolean }) => {
    await delay(800);
    
    let filteredProducts = [...mockProducts];
    
    if (params?.category) {
      filteredProducts = filteredProducts.filter(p => p.category === params.category);
    }
    
    if (params?.featured) {
      filteredProducts = filteredProducts.filter(p => p.featured);
    }
    
    return {
      data: {
        data: filteredProducts,
        total: filteredProducts.length
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  
  getProduct: async (id: string) => {
    await delay(500);
    const product = mockProducts.find(p => p._id === id);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return {
      data: {
        data: product
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  
  createCheckout: async (productId: string) => {
    await delay(1000);
    return {
      data: {
        data: {
          sessionId: 'mock_session_' + Date.now(),
          url: '#/mock-checkout'
        }
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  
  verifyCheckout: async (sessionId: string) => {
    await delay(800);
    const purchase = {
      ...mockPurchases[0],
      user: { _id: 'user1', username: 'testuser' }
    };
    
    return {
      data: {
        data: purchase
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  
  getUserPurchases: async () => {
    await delay(700);
    const purchases = mockPurchases.map(purchase => ({
      ...purchase,
      user: { _id: 'user1', username: 'testuser' }
    }));
    
    return {
      data: {
        data: purchases
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  },
  
  getDownloadLink: async (purchaseId: string) => {
    await delay(600);
    return {
      data: {
        data: {
          downloadUrl: 'https://example.com/download/mock-file.pdf',
          expiresIn: '24 hours'
        }
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };
  }
}; 