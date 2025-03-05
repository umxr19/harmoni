import Question, { IQuestion } from '../models/question';
import PracticeSet, { IPracticeSet } from '../models/practiceSet';
import Attempt from '../models/attempt';
import mongoose from 'mongoose';

export default class PracticeService {
  // Get a practice set by ID
  async getPracticeSet(setId: string, userId?: string): Promise<IQuestion[]> {
    // If setId is 'random', create a random set of questions
    if (setId === 'random') {
      return this.getRandomQuestions(10); // 10 random questions
    }
    
    // Otherwise, get the specified practice set
    const practiceSet = await PracticeSet.findById(setId);
    
    if (!practiceSet) {
      throw new Error('Practice set not found');
    }
    
    // Check if private set is accessible by this user
    if (!practiceSet.isPublic && (!userId || practiceSet.createdBy.toString() !== userId)) {
      throw new Error('You do not have access to this practice set');
    }
    
    // Get all questions in the set
    const questions = await Question.find({
      _id: { $in: practiceSet.questions }
    });
    
    return questions;
  }
  
  // Get random questions for practice
  async getRandomQuestions(count: number, filters?: {
    category?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
  }): Promise<IQuestion[]> {
    const query: any = {};
    
    if (filters?.category) {
      query.category = { $in: filters.category };
    }
    
    if (filters?.difficulty) {
      query.difficulty = filters.difficulty;
    }
    
    // Get random questions
    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: count } }
    ]);
    
    return questions;
  }
  
  // Create a new practice set
  async createPracticeSet(data: {
    name: string;
    description: string;
    questions: string[];
    category: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    createdBy: string;
    isPublic: boolean;
  }): Promise<IPracticeSet> {
    // Validate that all questions exist
    const questionCount = await Question.countDocuments({
      _id: { $in: data.questions.map(id => new mongoose.Types.ObjectId(id)) }
    });
    
    if (questionCount !== data.questions.length) {
      throw new Error('One or more questions do not exist');
    }
    
    const practiceSet = new PracticeSet({
      name: data.name,
      description: data.description,
      questions: data.questions,
      category: data.category,
      difficulty: data.difficulty,
      createdBy: data.createdBy,
      isPublic: data.isPublic
    });
    
    await practiceSet.save();
    return practiceSet;
  }
  
  // Get practice results for a user
  async getPracticeResults(setId: string, userId: string) {
    // Get the practice set
    const practiceSet = await PracticeSet.findById(setId);
    
    if (!practiceSet) {
      throw new Error('Practice set not found');
    }
    
    // Get all attempts for this user on questions in this set
    const attempts = await Attempt.find({
      user: userId,
      question: { $in: practiceSet.questions }
    }).populate('question', 'category');
    
    // Calculate overall stats
    const totalQuestions = practiceSet.questions.length;
    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    const averageTime = attempts.reduce((acc, curr) => acc + curr.timeSpent, 0) / attempts.length || 0;
    
    // Calculate category performance
    const categoryMap = new Map<string, { correct: number, total: number }>();
    
    attempts.forEach(attempt => {
      const question = attempt.question as any; // Type assertion for populated field
      
      question.category.forEach((cat: string) => {
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, { correct: 0, total: 0 });
        }
        
        const stats = categoryMap.get(cat)!;
        stats.total += 1;
        
        if (attempt.isCorrect) {
          stats.correct += 1;
        }
      });
    });
    
    const categoryPerformance = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      accuracy: (stats.correct / stats.total) * 100
    }));
    
    return {
      totalQuestions,
      correctAnswers,
      accuracy,
      averageTime,
      categoryPerformance
    };
  }
  
  // Get all public practice sets
  async getAllPracticeSets(userId?: string) {
    const query: any = { isPublic: true };
    
    // If userId is provided, also include private sets created by this user
    if (userId) {
      query.$or = [
        { isPublic: true },
        { createdBy: userId }
      ];
    }
    
    const practiceSets = await PracticeSet.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
      
    return practiceSets;
  }
  
  // Add this method to your PracticeService class
  async createSamplePracticeSets(userId: string) {
    // Check if we already have practice sets
    const existingSets = await PracticeSet.find();
    if (existingSets.length > 0) {
      return { message: 'Sample practice sets already exist' };
    }
    
    // Get all questions
    const allQuestions = await Question.find();
    
    if (allQuestions.length === 0) {
      throw new Error('No questions available to create practice sets');
    }
    
    // Create categories based on existing questions
    const categories = [...new Set(allQuestions.flatMap(q => q.category))];
    
    // Create a general practice set with all questions
    const generalSet = new PracticeSet({
      name: '11+ General Practice',
      description: 'A comprehensive set of questions covering various topics for 11+ exam preparation.',
      questions: allQuestions.map(q => q._id),
      category: categories,
      difficulty: 'medium',
      createdBy: userId,
      isPublic: true
    });
    
    await generalSet.save();
    
    // Create difficulty-based sets if we have enough questions
    if (allQuestions.length >= 3) {
      const easyQuestions = allQuestions
        .filter(q => q.difficulty === 'easy')
        .map(q => q._id);
        
      const mediumQuestions = allQuestions
        .filter(q => q.difficulty === 'medium')
        .map(q => q._id);
        
      const hardQuestions = allQuestions
        .filter(q => q.difficulty === 'hard')
        .map(q => q._id);
      
      if (easyQuestions.length > 0) {
        const easySet = new PracticeSet({
          name: 'Beginner Practice',
          description: 'Start your preparation with these easier questions to build confidence.',
          questions: easyQuestions,
          category: categories,
          difficulty: 'easy',
          createdBy: userId,
          isPublic: true
        });
        
        await easySet.save();
      }
      
      if (hardQuestions.length > 0) {
        const hardSet = new PracticeSet({
          name: 'Advanced Practice',
          description: 'Challenge yourself with these difficult questions to master the 11+ exam.',
          questions: hardQuestions,
          category: categories,
          difficulty: 'hard',
          createdBy: userId,
          isPublic: true
        });
        
        await hardSet.save();
      }
    }
    
    return { message: 'Sample practice sets created successfully' };
  }
} 