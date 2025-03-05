import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
    question: string;
    category: string[];
    subCategory?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    options: {
        text: string;
        isCorrect: boolean;
    }[];
    explanation?: string;
    imageUrl?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const QuestionSchema: Schema = new Schema({
    question: { 
        type: String, 
        required: true 
    },
    category: { 
        type: [String], 
        required: true 
    },
    subCategory: { 
        type: String 
    },
    difficulty: { 
        type: String, 
        enum: ['easy', 'medium', 'hard'],
        required: true 
    },
    options: [{ 
        text: { type: String, required: true },
        isCorrect: { type: Boolean, required: true }
    }],
    explanation: { 
        type: String 
    },
    imageUrl: { 
        type: String 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Add text index for search
QuestionSchema.index({ 
    question: 'text', 
    category: 'text' 
});

// Index for faster queries
QuestionSchema.index({ subjectId: 1 });
QuestionSchema.index({ difficulty: 1 });
QuestionSchema.index({ status: 1 });

// Check if the model exists before creating it to prevent the 'OverwriteModelError'
export const Question = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
export default Question;