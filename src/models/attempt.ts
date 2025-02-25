import mongoose, { Schema, Document } from 'mongoose';

export interface IAttempt extends Document {
    user: mongoose.Types.ObjectId;
    question: mongoose.Types.ObjectId;
    selectedOption: string;
    isCorrect: boolean;
    timeSpent: number; // in seconds
    createdAt: Date;
}

const AttemptSchema: Schema = new Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    question: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Question', 
        required: true 
    },
    selectedOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    timeSpent: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAttempt>('Attempt', AttemptSchema); 