import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  description: string;
  dueDate: Date;
  classroomId: mongoose.Types.ObjectId;
  questions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true
    },
    questions: [{
      type: Schema.Types.ObjectId,
      ref: 'Question'
    }]
  },
  {
    timestamps: true
  }
);

// Check if the model exists before creating it to prevent the 'OverwriteModelError'
export const Assignment = mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);
export default Assignment; 