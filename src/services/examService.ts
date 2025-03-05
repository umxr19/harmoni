import mongoose, { Types } from 'mongoose';
import Exam, { IExam } from '../models/exam';
import Question, { IQuestion } from '../models/question';
import ExamAttempt, { IExamAttempt } from '../models/examAttempt';
import { User } from '../models/userModel';

// Define interfaces for populated documents
interface PopulatedQuestion extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  text: string;
  options: {
    _id: mongoose.Types.ObjectId;
    text: string;
    isCorrect: boolean;
  }[];
}

interface PopulatedExam extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  duration: number;
  questions: PopulatedQuestion[];
}

interface PopulatedAttempt extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  exam: PopulatedExam;
  user: {
    _id: mongoose.Types.ObjectId;
    username: string;
  };
  startTime: Date;
  endTime: Date | null;
  answers: {
    question: mongoose.Types.ObjectId;
    selectedOption: string;
    isCorrect: boolean;
  }[];
  score: number;
  completed: boolean;
}

export default class ExamService {
  // Get all public exams
  async getPublicExams() {
    return Exam.find({ isPublic: true })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .lean();
  }

  // Get exams created by a teacher
  async getTeacherExams(teacherId: string) {
    return Exam.find({ createdBy: teacherId })
      .sort({ createdAt: -1 })
      .lean();
  }

  // Get a specific exam
  async getExam(examId: string) {
    return Exam.findById(examId)
      .populate('questions')
      .populate('createdBy', 'username')
      .lean();
  }

  // Create a new exam
  async createExam(examData: any) {
    const exam = new Exam({
      title: examData.title,
      description: examData.description,
      duration: examData.duration,
      questions: examData.questions,
      category: examData.category,
      difficulty: examData.difficulty,
      isPublic: examData.isPublic || false,
      createdBy: examData.createdBy
    });
    
    await exam.save();
    return exam;
  }

  // Start an exam attempt
  async startExam(examId: string, userId: string) {
    // Get the exam
    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) {
      throw new Error('Exam not found');
    }
    
    // Create a new attempt
    const attempt = new ExamAttempt({
      exam: examId,
      user: userId,
      startTime: new Date(),
      endTime: null,
      answers: [],
      score: 0,
      completed: false
    });
    
    await attempt.save();
    
    // Return the attempt with questions
    return {
      attemptId: attempt._id,
      examTitle: exam.title,
      duration: exam.duration,
      questions: (exam.questions as unknown as PopulatedQuestion[]).map((q) => ({
        _id: q._id,
        text: q.text,
        options: q.options.map((o) => ({
          _id: o._id,
          text: o.text
        }))
      }))
    };
  }

  // Submit an exam attempt
  async submitExam(attemptId: string, answers: any[]) {
    // Find the attempt
    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      throw new Error('Attempt not found');
    }
    
    if (attempt.completed) {
      throw new Error('This exam has already been submitted');
    }
    
    // Get the exam with questions
    const exam = await Exam.findById(attempt.exam).populate('questions');
    if (!exam) {
      throw new Error('Exam not found');
    }
    
    // Calculate score
    let correctAnswers = 0;
    const processedAnswers = [];
    
    for (const answer of answers) {
      const question = (exam.questions as unknown as PopulatedQuestion[])
        .find((q) => q._id.toString() === answer.questionId);
      
      if (!question) continue;
      
      const correctOption = question.options.find((o) => o.isCorrect);
      const isCorrect = !!(correctOption && answer.selectedOptionId === correctOption._id.toString());
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      processedAnswers.push({
        question: answer.questionId,
        selectedOption: answer.selectedOptionId,
        isCorrect: isCorrect
      });
    }
    
    const score = (correctAnswers / (exam.questions as unknown as PopulatedQuestion[]).length) * 100;
    
    // Update the attempt
    attempt.answers = processedAnswers as any;
    attempt.score = score;
    attempt.endTime = new Date();
    attempt.completed = true;
    
    await attempt.save();
    
    return {
      attemptId,
      score,
      totalQuestions: (exam.questions as unknown as PopulatedQuestion[]).length,
      correctAnswers
    };
  }

  // Get exam results
  async getExamResults(attemptId: string) {
    const attempt = await ExamAttempt.findById(attemptId)
      .populate({
        path: 'exam',
        populate: {
          path: 'questions'
        }
      })
      .populate('user', 'username')
      .lean() as unknown as PopulatedAttempt;
    
    if (!attempt) {
      throw new Error('Attempt not found');
    }
    
    if (!attempt.completed) {
      throw new Error('This exam has not been completed yet');
    }
    
    return {
      examId: attempt.exam._id,
      examTitle: attempt.exam.title,
      score: attempt.score,
      totalQuestions: attempt.exam.questions.length,
      percentageScore: attempt.score,
      timeTaken: attempt.endTime 
        ? Math.round((attempt.endTime.getTime() - attempt.startTime.getTime()) / 60000) 
        : 0,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      answers: attempt.answers
    };
  }

  // Create sample exams (for testing)
  async createSampleExams(userId: string) {
    // Get some questions to use in the exams
    const mathQuestions = await Question.find({ 
      category: { $in: ['Mathematics', 'Arithmetic'] } 
    }).limit(10);
    
    const englishQuestions = await Question.find({ 
      category: { $in: ['English', 'Grammar'] } 
    }).limit(10);
    
    const scienceQuestions = await Question.find({ 
      category: { $in: ['Science', 'Physics', 'Chemistry'] } 
    }).limit(10);
    
    // Create sample exams
    const exams = [
      {
        title: 'Basic Math Test',
        description: 'Test your basic math skills',
        duration: 30, // minutes
        questions: mathQuestions.map(q => q._id),
        category: ['Mathematics'],
        difficulty: 'easy' as const,
        isPublic: true,
        createdBy: userId
      },
      {
        title: 'English Grammar Test',
        description: 'Test your grammar knowledge',
        duration: 45,
        questions: englishQuestions.map(q => q._id),
        category: ['English'],
        difficulty: 'medium' as const,
        isPublic: true,
        createdBy: userId
      },
      {
        title: 'Science Quiz',
        description: 'Test your science knowledge',
        duration: 60,
        questions: scienceQuestions.map(q => q._id),
        category: ['Science'],
        difficulty: 'hard' as const,
        isPublic: false,
        createdBy: userId
      }
    ];
    
    // Save the exams
    const createdExams = await Exam.insertMany(exams);
    
    return {
      message: 'Sample exams created successfully',
      count: createdExams.length,
      exams: createdExams.map(exam => ({
        _id: exam._id,
        title: exam.title
      }))
    };
  }
} 