import mongoose, { Schema, Document } from 'mongoose';

export interface IExam extends Document {
  title: string;
  description: string;
  duration: number; // in minutes
  questions: mongoose.Types.ObjectId[];
  category: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  isPublic: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  duration: { 
    type: Number, 
    required: true,
    min: 1
  },
  questions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question' 
  }],
  category: [{ 
    type: String 
  }],
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isPublic: { 
    type: Boolean, 
    default: false 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }
}, { 
  timestamps: true 
});

// Index for faster queries
ExamSchema.index({ createdBy: 1 });
ExamSchema.index({ isPublic: 1 });
ExamSchema.index({ category: 1 });

export default mongoose.model<IExam>('Exam', ExamSchema); 