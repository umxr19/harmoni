import mongoose, { Schema, Document } from 'mongoose';

export interface IOption {
    text: string;
    isCorrect: boolean;
}

export interface IQuestion extends Document {
    title: string;
    content: string;
    options: IOption[];
    category: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    createdBy: mongoose.Types.ObjectId;
    imageUrl?: string;
    createdAt: Date;
}

const QuestionSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    options: [{
        text: { type: String, required: true },
        isCorrect: { type: Boolean, required: true }
    }],
    category: [{ type: String, required: true }],
    difficulty: { 
        type: String, 
        enum: ['easy', 'medium', 'hard'],
        required: true 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
});

// Add text index for search
QuestionSchema.index({ 
    title: 'text', 
    content: 'text',
    category: 'text' 
});

export default mongoose.model<IQuestion>('Question', QuestionSchema);