import mongoose, { Document, Types } from 'mongoose';
import Attempt from '../models/attempt';
import { User, IUser } from '../models/userModel';
import Question, { IQuestion } from '../models/question';
import { Progress } from '../models/progressModel';

// Define interfaces for populated documents
interface PopulatedQuestion extends Document {
  _id: Types.ObjectId;
  text: string;
  category: string;
  difficulty: string;
  options: {
    _id: Types.ObjectId;
    text: string;
    isCorrect: boolean;
  }[];
}

interface PopulatedAttempt extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  question: PopulatedQuestion;
  selectedOption: string;
  isCorrect: boolean;
  timeSpent: number;
  createdAt: Date;
}

// Update the User interface to include childrenIds
interface ParentUser extends IUser {
  childrenIds?: Types.ObjectId[];
}

export default class ProgressService {
  // Record a new attempt
  async recordAttempt(data: {
    userId: string;
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
    timeSpent: number;
  }) {
    const attempt = new Attempt({
      user: data.userId,
      question: data.questionId,
      selectedOption: data.selectedOption,
      isCorrect: data.isCorrect,
      timeSpent: data.timeSpent
    });
    
    await attempt.save();
    return attempt;
  }

  // Get user progress
  async getUserProgress(userId: string) {
    const attempts = await Attempt.find({ user: userId });
    
    // Calculate overall stats
    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(a => a.isCorrect).length;
    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
    
    // Get category breakdown
    const questionIds = attempts.map(a => a.question);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean() as unknown as IQuestion[];
    
    const categoryMap = new Map<string, { total: number; correct: number }>();
    for (const attempt of attempts) {
      const question = questions.find(q => 
        (q._id as Types.ObjectId).toString() === (attempt.question as Types.ObjectId).toString()
      );
      
      if (!question) continue;
      
      // Handle category being either a string or an array of strings
      const categories = Array.isArray(question.category) 
        ? question.category 
        : [question.category];
      
      // Process each category in the array
      for (const category of categories) {
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { total: 0, correct: 0 });
        }
        
        const stats = categoryMap.get(category)!;
        stats.total++;
        if (attempt.isCorrect) {
          stats.correct++;
        }
      }
    }
    
    const categoryProgress = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      totalAttempts: stats.total,
      correctAttempts: stats.correct,
      accuracy: (stats.correct / stats.total) * 100
    }));
    
    return {
      totalAttempts,
      correctAttempts,
      accuracy,
      categoryProgress
    };
  }

  // Get progress for a specific category
  async getCategoryProgress(userId: string, category: string) {
    const attempts = await Attempt.find({ user: userId })
      .populate({
        path: 'question',
        match: { category }
      })
      .lean() as unknown as PopulatedAttempt[];
    
    // Filter out attempts where question is null (category didn't match)
    const filteredAttempts = attempts.filter(a => a.question);
    
    const totalAttempts = filteredAttempts.length;
    const correctAttempts = filteredAttempts.filter(a => a.isCorrect).length;
    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
    
    // Get difficulty breakdown
    const difficultyMap = new Map<string, { total: number; correct: number }>();
    for (const attempt of filteredAttempts) {
      const difficulty = attempt.question.difficulty;
      
      if (!difficultyMap.has(difficulty)) {
        difficultyMap.set(difficulty, { total: 0, correct: 0 });
      }
      
      const stats = difficultyMap.get(difficulty)!;
      stats.total++;
      if (attempt.isCorrect) {
        stats.correct++;
      }
    }
    
    const difficultyProgress = Array.from(difficultyMap.entries()).map(([difficulty, stats]) => ({
      difficulty,
      totalAttempts: stats.total,
      correctAttempts: stats.correct,
      accuracy: (stats.correct / stats.total) * 100
    }));
    
    return {
      category,
      totalAttempts,
      correctAttempts,
      accuracy,
      difficultyProgress
    };
  }

  // Get children for a parent user
  async getParentChildren(parentId: string) {
    const parent = await User.findById(parentId).lean() as unknown as ParentUser;
    
    if (!parent) {
      throw new Error('User not found');
    }
    
    // Check if user is a parent - allow any role to access for now
    // if (parent.role !== 'parent') {
    //   throw new Error('User is not a parent');
    // }
    
    // Use an empty array if childrenIds doesn't exist
    const childrenIds = parent.childrenIds || [];
    
    // Find all children
    const children = await User.find({ 
      _id: { $in: childrenIds },
      role: 'student'
    })
    .select('_id username email')
    .lean();
    
    return children;
  }

  // Get a child's recent activity
  async getChildRecentActivity(childId: string) {
    const attempts = await Attempt.find({ user: childId })
      .populate('question')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean() as unknown as PopulatedAttempt[];
    
    return attempts.map(attempt => ({
      id: attempt._id,
      questionId: attempt.question._id,
      questionText: attempt.question.text,
      category: attempt.question.category,
      isCorrect: attempt.isCorrect,
      date: attempt.createdAt
    }));
  }

  // Get detailed history of user attempts
  async getUserAttemptHistory(userId: string, limit = 20) {
    return Attempt.find({ user: userId })
      .populate('question')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean() as unknown as PopulatedAttempt[];
  }
} 