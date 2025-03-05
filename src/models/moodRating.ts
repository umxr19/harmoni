import mongoose, { Schema, Document } from 'mongoose';

export interface IMoodRating extends Document {
    userId: mongoose.Types.ObjectId;
    sessionId?: string;
    examId?: string;
    moodValue: number; // 1-5 scale
    timestamp: Date;
}

// Define a type for the document in the validation function context
interface MoodRatingDocument {
    sessionId?: string;
    examId?: string;
}

const MoodRatingSchema: Schema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    sessionId: { 
        type: String,
        // Use a validator function instead of the required property
        validate: {
            validator: function(this: MoodRatingDocument) {
                return this.sessionId || this.examId;
            },
            message: 'Either sessionId or examId must be provided'
        }
    },
    examId: { 
        type: String,
        // Use a validator function instead of the required property
        validate: {
            validator: function(this: MoodRatingDocument) {
                return this.sessionId || this.examId;
            },
            message: 'Either sessionId or examId must be provided'
        }
    },
    moodValue: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
}, { 
    timestamps: true 
});

// Create indexes for faster queries
MoodRatingSchema.index({ userId: 1, timestamp: -1 });
MoodRatingSchema.index({ userId: 1, sessionId: 1 });
MoodRatingSchema.index({ userId: 1, examId: 1 });

export default mongoose.model<IMoodRating>('MoodRating', MoodRatingSchema); 