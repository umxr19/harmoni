import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: 'student' | 'teacher' | 'admin';
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    avatarUrl?: string;
    classrooms?: Array<{
        classroomId: mongoose.Types.ObjectId;
        teacherId?: mongoose.Types.ObjectId;
    }>;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    avatarUrl: {
        type: String
    },
    classrooms: [{
        classroomId: {
            type: Schema.Types.ObjectId,
            ref: 'Classroom'
        },
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

export const User = mongoose.model<IUser>('User', userSchema); 