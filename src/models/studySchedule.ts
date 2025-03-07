import mongoose, { Document, Schema } from 'mongoose';

interface ScheduleDay {
  subject: string;
  duration: string;
  focus: string;
  motivation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface IStudySchedule extends Document {
  userId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  schedule: Record<string, ScheduleDay>;
  generatedAt: Date;
  isAIGenerated: boolean;
}

const studyScheduleSchema = new Schema<IStudySchedule>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  schedule: {
    type: Map,
    of: {
      subject: String,
      duration: String,
      focus: String,
      motivation: String,
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard']
      }
    },
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  isAIGenerated: {
    type: Boolean,
    default: true
  }
});

export const StudySchedule = mongoose.model<IStudySchedule>('StudySchedule', studyScheduleSchema); 