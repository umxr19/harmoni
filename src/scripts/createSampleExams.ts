import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exam from '../models/exam';
import Question from '../models/question';
import { User } from '../models/userModel';
import logger from '../utils/logger';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/question-bank')
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

const createSampleExams = async () => {
  try {
    // Find an admin user to be the creator
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      logger.info('No admin user found. Please create an admin user first.');
      mongoose.disconnect();
      return;
    }
    
    // Get questions by category
    const verbalQuestions = await Question.find({ category: "Verbal Reasoning" }).limit(10);
    const nonVerbalQuestions = await Question.find({ category: "Non-Verbal Reasoning" }).limit(5);
    const mathQuestions = await Question.find({ category: "Mathematics" }).limit(10);
    const englishQuestions = await Question.find({ category: "English" }).limit(5);
    
    // Check if we have enough questions
    if (verbalQuestions.length < 5 || nonVerbalQuestions.length < 3 || 
        mathQuestions.length < 5 || englishQuestions.length < 3) {
      
      // If we don't have enough questions, let's create some basic ones
      logger.info('Not enough questions found. Creating basic questions...');
      
      // Create basic math questions
      const basicMathQuestions = [];
      for (let i = 1; i <= 10; i++) {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const sum = a + b;
        
        const question = new Question({
          question: `What is ${a} + ${b}?`,
          options: [
            { text: `${sum - 2}`, isCorrect: false },
            { text: `${sum}`, isCorrect: true },
            { text: `${sum + 2}`, isCorrect: false },
            { text: `${sum + 4}`, isCorrect: false }
          ],
          explanation: `${a} + ${b} = ${sum}`,
          category: ["Mathematics"],
          subCategory: "Arithmetic",
          difficulty: "easy",
          estimatedTime: 20
        });
        
        await question.save();
        basicMathQuestions.push(question);
      }
      
      // Create basic English questions
      const basicEnglishQuestions = [];
      for (let i = 1; i <= 5; i++) {
        const question = new Question({
          question: `Which word is spelled correctly?`,
          options: [
            { text: `Accomodate`, isCorrect: false },
            { text: `Accommodate`, isCorrect: true },
            { text: `Acommodate`, isCorrect: false },
            { text: `Acomodate`, isCorrect: false }
          ],
          explanation: `The correct spelling is "Accommodate" with two 'c's and two 'm's.`,
          category: ["English"],
          subCategory: "Spelling",
          difficulty: "medium",
          estimatedTime: 25
        });
        
        await question.save();
        basicEnglishQuestions.push(question);
      }
      
      // Use these questions for our exams
      const mathExam = new Exam({
        title: 'Basic Math Practice',
        description: 'A simple exam with basic math questions.',
        duration: 15,
        questions: basicMathQuestions.map(q => q._id),
        category: ['Mathematics', 'Practice'],
        difficulty: 'easy',
        createdBy: adminUser._id,
        isPublic: true
      });
      
      const englishExam = new Exam({
        title: 'English Spelling Practice',
        description: 'Practice your spelling skills with this short exam.',
        duration: 10,
        questions: basicEnglishQuestions.map(q => q._id),
        category: ['English', 'Spelling'],
        difficulty: 'medium',
        createdBy: adminUser._id,
        isPublic: true
      });
      
      await mathExam.save();
      await englishExam.save();
      
      logger.info('Created 2 sample exams with basic questions.');
    } else {
      // Create exams with the existing questions
      const verbalExam = new Exam({
        title: 'Verbal Reasoning Practice',
        description: 'A focused exam to practice verbal reasoning skills for the 11+ exam.',
        duration: 20,
        questions: verbalQuestions.map(q => q._id),
        category: ['Verbal Reasoning', '11+ Preparation'],
        difficulty: 'medium',
        createdBy: adminUser._id,
        isPublic: true
      });
      
      const mathExam = new Exam({
        title: 'Mathematics Practice',
        description: 'Sharpen your math skills with this 11+ focused practice exam.',
        duration: 25,
        questions: mathQuestions.map(q => q._id),
        category: ['Mathematics', '11+ Preparation'],
        difficulty: 'medium',
        createdBy: adminUser._id,
        isPublic: true
      });
      
      const fullExam = new Exam({
        title: 'Complete 11+ Practice Exam',
        description: 'A comprehensive exam covering all sections of the 11+ test.',
        duration: 45,
        questions: [
          ...verbalQuestions.slice(0, 5),
          ...nonVerbalQuestions.slice(0, 3),
          ...mathQuestions.slice(0, 5),
          ...englishQuestions.slice(0, 3)
        ].map(q => q._id),
        category: ['11+ Preparation', 'Full Test'],
        difficulty: 'hard',
        createdBy: adminUser._id,
        isPublic: true
      });
      
      await Promise.all([
        verbalExam.save(),
        mathExam.save(),
        fullExam.save()
      ]);
      
      logger.info('Created 3 sample exams successfully.');
    }
    
    mongoose.disconnect();
  } catch (error) {
    logger.error('Error creating sample exams:', error);
    mongoose.disconnect();
  }
};

createSampleExams(); 