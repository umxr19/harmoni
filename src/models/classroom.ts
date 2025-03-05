import mongoose, { Schema, Document } from 'mongoose';

export interface IClassroom extends Document {
  name: string;
  description: string;
  gradeLevel: 'elementary' | 'middle' | 'high';
  subject: string;
  teacherId: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ClassroomSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  gradeLevel: { 
    type: String, 
    enum: ['elementary', 'middle', 'high'],
    required: true
  },
  subject: { 
    type: String,
    required: true
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, { 
  timestamps: true 
});

// Index for faster queries
ClassroomSchema.index({ teacherId: 1 });
ClassroomSchema.index({ students: 1 });

// Check if the model exists before creating it to prevent the 'OverwriteModelError'
export const Classroom = mongoose.models.Classroom || mongoose.model<IClassroom>('Classroom', ClassroomSchema);
export default Classroom; 