import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
    title: string;
    content: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options?: string[];
    correctAnswer: string;
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer'],
        required: true
    },
    options: [{
        type: String,
        trim: true
    }],
    correctAnswer: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
questionSchema.index({ category: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ createdBy: 1 });

export const Question = mongoose.model<IQuestion>('Question', questionSchema); 