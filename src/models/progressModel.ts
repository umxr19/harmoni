import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
    userId: mongoose.Types.ObjectId;
    questionId: mongoose.Types.ObjectId;
    isCorrect: boolean;
    score: number;
    timeSpent: number;
    type?: 'question' | 'exam' | 'practice';
    createdAt: Date;
    updatedAt: Date;
}

const progressSchema = new Schema<IProgress>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    timeSpent: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        enum: ['question', 'exam', 'practice'],
        default: 'question'
    }
}, {
    timestamps: true
});

// Create compound index for userId and questionId
progressSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const Progress = mongoose.model<IProgress>('Progress', progressSchema); 