import mongoose, { Schema, Document } from 'mongoose';

interface Answer {
  question: mongoose.Types.ObjectId;
  selectedOption: string;
  isCorrect: boolean;
}

export interface IExamAttempt extends Document {
  exam: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date | null;
  answers: Answer[];
  score: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExamAttemptSchema: Schema = new Schema({
  exam: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exam',
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date, 
    default: null 
  },
  answers: [{
    question: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Question' 
    },
    selectedOption: { 
      type: String 
    },
    isCorrect: { 
      type: Boolean 
    }
  }],
  score: { 
    type: Number, 
    default: 0 
  },
  completed: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

// Index for faster queries
ExamAttemptSchema.index({ exam: 1, user: 1 });
ExamAttemptSchema.index({ user: 1 });
ExamAttemptSchema.index({ completed: 1 });

export default mongoose.model<IExamAttempt>('ExamAttempt', ExamAttemptSchema); 