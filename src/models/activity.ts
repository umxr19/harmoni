import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'question' | 'practice' | 'exam';
    itemId: string;
    result: {
        score?: number;
        isCorrect?: boolean;
        timeSpent: number;
        answers?: any[];
    };
    metadata?: {
        category?: string;
        categories?: string[];
        title?: string;
        difficulty?: string;
        [key: string]: any;
    };
    createdAt: Date;
}

const ActivitySchema: Schema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['question', 'practice', 'exam'], 
        required: true 
    },
    itemId: { 
        type: String, 
        required: true 
    },
    result: {
        score: Number,
        isCorrect: Boolean,
        timeSpent: { type: Number, required: true },
        answers: [Schema.Types.Mixed]
    },
    metadata: {
        category: String,
        categories: [String],
        title: String,
        difficulty: String
    }
}, { 
    timestamps: true 
});

// Create indexes for faster queries
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ userId: 1, 'metadata.category': 1 });
ActivitySchema.index({ userId: 1, type: 1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema); 