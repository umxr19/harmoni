import mongoose, { Types } from 'mongoose';
import { Classroom } from '../models/classroomModel';
import { User, IUser } from '../models/userModel';
import { sendEmail } from '../utils/emailService';
import crypto from 'crypto';
import Assignment from '../models/assignment';
import logger from '../utils/logger';

// Define interfaces for populated documents
interface PopulatedTeacher {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
}

interface PopulatedStudent {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
}

interface IClassroom {
  _id: string | Types.ObjectId;
  name: string;
  description: string;
  teacherId: string;
  students: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface PopulatedClassroom extends Omit<IClassroom, 'teacherId' | 'students'> {
  teacherId: PopulatedTeacher;
  students: PopulatedStudent[];
}

interface FormattedClassroom {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  teacherId: mongoose.Types.ObjectId;
  teacherName: string;
}

export default class ClassroomService {
  // Get all classrooms for a teacher
  async getTeacherClassrooms(teacherId: string): Promise<PopulatedClassroom[]> {
    logger.info(`Fetching classrooms for teacher: ${teacherId}`);
    const classrooms = await Classroom.find({ teacherId })
      .populate('teacherId', 'username email')
      .sort({ createdAt: -1 })
      .lean() as unknown as PopulatedClassroom[];
    
    if (!classrooms) {
      throw new Error('Failed to fetch teacher classrooms');
    }
    
    logger.info(`Found ${classrooms.length} classrooms for teacher`);
    return classrooms;
  }

  // Get all classrooms for a student
  async getStudentClassrooms(studentId: string): Promise<FormattedClassroom[]> {
    logger.info(`Fetching classrooms for student: ${studentId}`);
    
    // Find classrooms where the student is in the students array
    const classrooms = await Classroom.find({ students: studentId })
      .populate('teacherId', 'username email')
      .sort({ createdAt: -1 })
      .lean() as unknown as PopulatedClassroom[];
    
    if (!classrooms) {
      throw new Error('Failed to fetch student classrooms');
    }
    
    logger.info(`Found ${classrooms.length} classrooms for student`);
    
    // Format the response to match the frontend expectations
    return classrooms.map(classroom => ({
      // Convert _id to string to fix type issue
      _id: classroom._id.toString(),
      name: classroom.name,
      description: classroom.description,
      teacherId: classroom.teacherId._id,
      teacherName: classroom.teacherId.username
    })) as unknown as FormattedClassroom[];
  }

  // Get all assignments for a student
  async getStudentAssignments(studentId: string) {
    logger.info(`Fetching assignments for student: ${studentId}`);
    
    // Find classrooms where the student is enrolled
    const classrooms = await Classroom.find({ students: studentId })
      .select('_id name')
      .lean();
    
    if (!classrooms) {
      throw new Error('Failed to fetch student classrooms for assignments');
    }
    
    const classroomIds = classrooms.map(c => c._id);
    logger.info(`Found ${classrooms.length} classrooms for student assignments`);
    
    // Find assignments for these classrooms
    const assignments = await Assignment.find({ 
      classroomId: { $in: classroomIds } 
    }).lean();
    
    // Create a map of classroom IDs to names for easy lookup
    const classroomMap: Record<string, string> = {};
    classrooms.forEach(classroom => {
      const id = classroom._id.toString();
      classroomMap[id] = classroom.name;
    });
    
    logger.info(`Found ${assignments.length} assignments for student`);
    
    // Format the response to match the frontend expectations
    return assignments.map(assignment => {
      const classroomId = assignment.classroomId.toString();
      return {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        classroomId: assignment.classroomId,
        classroomName: classroomMap[classroomId] || 'Unknown Classroom',
        completed: false // You would need to check completion status from a separate collection
      };
    });
  }

  // Get a specific classroom
  async getClassroom(classroomId: string): Promise<PopulatedClassroom> {
    logger.info(`Fetching classroom: ${classroomId}`);
    const classroom = await Classroom.findById(classroomId)
      .populate('teacherId', 'username email')
      .populate('students', 'username email')
      .lean() as unknown as PopulatedClassroom;
    
    if (!classroom) {
      throw new Error('Classroom not found');
    }
    
    logger.info(`Found classroom: ${classroom.name}`);
    return classroom;
  }

  // Create a classroom
  async createClassroom(data: Partial<IClassroom>) {
    logger.info('Creating new classroom');
    const classroom = new Classroom(data);
    await classroom.save();
    logger.info(`Created classroom: ${classroom.name}`);
    return classroom.toObject();
  }

  // Update a classroom
  async updateClassroom(classroomId: string, updates: Partial<IClassroom>) {
    logger.info(`Updating classroom: ${classroomId}`);
    const classroom = await Classroom.findByIdAndUpdate(
      classroomId,
      { $set: updates },
      { new: true }
    ).lean();
    
    if (!classroom) {
      throw new Error('Classroom not found');
    }
    
    logger.info(`Updated classroom: ${classroom.name}`);
    return classroom;
  }

  // Delete a classroom
  async deleteClassroom(classroomId: string) {
    logger.info(`Deleting classroom: ${classroomId}`);
    const result = await Classroom.findByIdAndDelete(classroomId);
    
    if (!result) {
      throw new Error('Classroom not found');
    }
    
    logger.info('Classroom deleted successfully');
    return result;
  }

  // Get students in a classroom
  async getClassroomStudents(classroomId: string) {
    logger.info(`Fetching students for classroom: ${classroomId}`);
    const classroom = await Classroom.findById(classroomId)
      .populate('students', 'username email')
      .lean();
    
    if (!classroom) {
      throw new Error('Classroom not found');
    }
    
    logger.info(`Found ${classroom.students.length} students in classroom`);
    return classroom.students;
  }

  // Check if a user has access to a classroom
  async checkClassroomAccess(classroomId: string, userId: string, role: string) {
    logger.info(`Checking access for user ${userId} with role ${role} to classroom ${classroomId}`);
    const classroom = await Classroom.findById(classroomId).lean();
    
    if (!classroom) {
      throw new Error('Classroom not found');
    }
    
    if (role === 'admin') {
      return true;
    }
    
    if (role === 'teacher' && classroom.teacherId.toString() === userId) {
      return true;
    }
    
    if (role === 'student' && classroom.students.some(studentId => 
      studentId.toString() === userId
    )) {
      return true;
    }
    
    throw new Error('Access denied to classroom');
  }

  // Invite students to a classroom
  async inviteStudents(classroomId: string, emails: string[]) {
    logger.info(`Inviting students to classroom: ${classroomId}`);
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      throw new Error('Classroom not found');
    }

    const results = [];
    
    for (const email of emails) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email }) as IUser | null;
        
        if (existingUser) {
          // Add user to classroom if not already added
          const userObjectId = existingUser._id as Types.ObjectId;
          
          // Check if student is already in the classroom
          const isStudentInClassroom = classroom.students.some(
            (studentId) => studentId.toString() === userObjectId.toString()
          );
          
          if (!isStudentInClassroom) {
            classroom.students.push(userObjectId);
            results.push({ email, status: 'added' });
            
            // Send notification email
            await sendEmail({
              to: email,
              subject: `You've been added to ${classroom.name}`,
              text: `You have been added to the classroom "${classroom.name}". Log in to your account to access it.`
            });
          } else {
            results.push({ email, status: 'already_added' });
          }
        } else {
          results.push({ email, status: 'user_not_found' });
        }
      } catch (error) {
        logger.error(`Error inviting student ${email}:`, error);
        results.push({ email, status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
    
    await classroom.save();
    logger.info(`Invited ${results.length} students to classroom`);
    return results;
  }

  // Remove a student from a classroom
  async removeStudent(classroomId: string, studentId: string) {
    logger.info(`Removing student ${studentId} from classroom ${classroomId}`);
    const result = await Classroom.updateOne(
      { _id: classroomId },
      { $pull: { students: studentId } }
    );
    
    if (result.modifiedCount === 0) {
      throw new Error('Failed to remove student from classroom');
    }
    
    logger.info('Student removed successfully');
    return true;
  }
} 