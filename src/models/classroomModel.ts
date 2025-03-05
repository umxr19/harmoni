import mongoose, { Document, Schema } from 'mongoose';

export interface IClassroom extends Document {
    name: string;
    description: string;
    teacherId: mongoose.Types.ObjectId;
    students: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const classroomSchema = new Schema<IClassroom>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Indexes for efficient queries
classroomSchema.index({ teacherId: 1 });
classroomSchema.index({ students: 1 });

export const Classroom = mongoose.model<IClassroom>('Classroom', classroomSchema); 