import mongoose, { Schema, Document } from 'mongoose';

export interface IJournalEntry extends Document {
    userId: mongoose.Types.ObjectId;
    entryText: string;
    timestamp: Date;
    tags?: string[];
}

const JournalEntrySchema: Schema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    entryText: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    tags: [String] // Optional tags for categorizing entries
}, { 
    timestamps: true 
});

// Create indexes for faster queries
JournalEntrySchema.index({ userId: 1, timestamp: -1 });
JournalEntrySchema.index({ userId: 1, tags: 1 });

export default mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema); 