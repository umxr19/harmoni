import mongoose, { Schema, Document } from 'mongoose';

export interface IPracticeSet extends Document {
  name: string;
  description: string;
  questions: mongoose.Types.ObjectId[];
  category: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
}

const PracticeSetSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  questions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question',
    required: true 
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
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPracticeSet>('PracticeSet', PracticeSetSchema); 