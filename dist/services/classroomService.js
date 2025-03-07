"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const classroomModel_1 = require("../models/classroomModel");
const userModel_1 = require("../models/userModel");
const emailService_1 = require("../utils/emailService");
const assignment_1 = __importDefault(require("../models/assignment"));
const logger_1 = __importDefault(require("../utils/logger"));
class ClassroomService {
    // Get all classrooms for a teacher
    getTeacherClassrooms(teacherId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Fetching classrooms for teacher: ${teacherId}`);
            const classrooms = yield classroomModel_1.Classroom.find({ teacherId })
                .populate('teacherId', 'username email')
                .sort({ createdAt: -1 })
                .lean();
            if (!classrooms) {
                throw new Error('Failed to fetch teacher classrooms');
            }
            logger_1.default.info(`Found ${classrooms.length} classrooms for teacher`);
            return classrooms;
        });
    }
    // Get all classrooms for a student
    getStudentClassrooms(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Fetching classrooms for student: ${studentId}`);
            // Find classrooms where the student is in the students array
            const classrooms = yield classroomModel_1.Classroom.find({ students: studentId })
                .populate('teacherId', 'username email')
                .sort({ createdAt: -1 })
                .lean();
            if (!classrooms) {
                throw new Error('Failed to fetch student classrooms');
            }
            logger_1.default.info(`Found ${classrooms.length} classrooms for student`);
            // Format the response to match the frontend expectations
            return classrooms.map(classroom => ({
                // Convert _id to string to fix type issue
                _id: classroom._id.toString(),
                name: classroom.name,
                description: classroom.description,
                teacherId: classroom.teacherId._id,
                teacherName: classroom.teacherId.username
            }));
        });
    }
    // Get all assignments for a student
    getStudentAssignments(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Fetching assignments for student: ${studentId}`);
            // Find classrooms where the student is enrolled
            const classrooms = yield classroomModel_1.Classroom.find({ students: studentId })
                .select('_id name')
                .lean();
            if (!classrooms) {
                throw new Error('Failed to fetch student classrooms for assignments');
            }
            const classroomIds = classrooms.map(c => c._id);
            logger_1.default.info(`Found ${classrooms.length} classrooms for student assignments`);
            // Find assignments for these classrooms
            const assignments = yield assignment_1.default.find({
                classroomId: { $in: classroomIds }
            }).lean();
            // Create a map of classroom IDs to names for easy lookup
            const classroomMap = {};
            classrooms.forEach(classroom => {
                const id = classroom._id.toString();
                classroomMap[id] = classroom.name;
            });
            logger_1.default.info(`Found ${assignments.length} assignments for student`);
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
        });
    }
    // Get a specific classroom
    getClassroom(classroomId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Fetching classroom: ${classroomId}`);
            const classroom = yield classroomModel_1.Classroom.findById(classroomId)
                .populate('teacherId', 'username email')
                .populate('students', 'username email')
                .lean();
            if (!classroom) {
                throw new Error('Classroom not found');
            }
            logger_1.default.info(`Found classroom: ${classroom.name}`);
            return classroom;
        });
    }
    // Create a classroom
    createClassroom(data) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info('Creating new classroom');
            const classroom = new classroomModel_1.Classroom(data);
            yield classroom.save();
            logger_1.default.info(`Created classroom: ${classroom.name}`);
            return classroom.toObject();
        });
    }
    // Update a classroom
    updateClassroom(classroomId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Updating classroom: ${classroomId}`);
            const classroom = yield classroomModel_1.Classroom.findByIdAndUpdate(classroomId, { $set: updates }, { new: true }).lean();
            if (!classroom) {
                throw new Error('Classroom not found');
            }
            logger_1.default.info(`Updated classroom: ${classroom.name}`);
            return classroom;
        });
    }
    // Delete a classroom
    deleteClassroom(classroomId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Deleting classroom: ${classroomId}`);
            const result = yield classroomModel_1.Classroom.findByIdAndDelete(classroomId);
            if (!result) {
                throw new Error('Classroom not found');
            }
            logger_1.default.info('Classroom deleted successfully');
            return result;
        });
    }
    // Get students in a classroom
    getClassroomStudents(classroomId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Fetching students for classroom: ${classroomId}`);
            const classroom = yield classroomModel_1.Classroom.findById(classroomId)
                .populate('students', 'username email')
                .lean();
            if (!classroom) {
                throw new Error('Classroom not found');
            }
            logger_1.default.info(`Found ${classroom.students.length} students in classroom`);
            return classroom.students;
        });
    }
    // Check if a user has access to a classroom
    checkClassroomAccess(classroomId, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Checking access for user ${userId} with role ${role} to classroom ${classroomId}`);
            const classroom = yield classroomModel_1.Classroom.findById(classroomId).lean();
            if (!classroom) {
                throw new Error('Classroom not found');
            }
            if (role === 'admin') {
                return true;
            }
            if (role === 'teacher' && classroom.teacherId.toString() === userId) {
                return true;
            }
            if (role === 'student' && classroom.students.some(studentId => studentId.toString() === userId)) {
                return true;
            }
            throw new Error('Access denied to classroom');
        });
    }
    // Invite students to a classroom
    inviteStudents(classroomId, emails) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Inviting students to classroom: ${classroomId}`);
            const classroom = yield classroomModel_1.Classroom.findById(classroomId);
            if (!classroom) {
                throw new Error('Classroom not found');
            }
            const results = [];
            for (const email of emails) {
                try {
                    // Check if user already exists
                    const existingUser = yield userModel_1.User.findOne({ email });
                    if (existingUser) {
                        // Add user to classroom if not already added
                        const userObjectId = existingUser._id;
                        // Check if student is already in the classroom
                        const isStudentInClassroom = classroom.students.some((studentId) => studentId.toString() === userObjectId.toString());
                        if (!isStudentInClassroom) {
                            classroom.students.push(userObjectId);
                            results.push({ email, status: 'added' });
                            // Send notification email
                            yield (0, emailService_1.sendEmail)({
                                to: email,
                                subject: `You've been added to ${classroom.name}`,
                                text: `You have been added to the classroom "${classroom.name}". Log in to your account to access it.`
                            });
                        }
                        else {
                            results.push({ email, status: 'already_added' });
                        }
                    }
                    else {
                        results.push({ email, status: 'user_not_found' });
                    }
                }
                catch (error) {
                    logger_1.default.error(`Error inviting student ${email}:`, error);
                    results.push({ email, status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
                }
            }
            yield classroom.save();
            logger_1.default.info(`Invited ${results.length} students to classroom`);
            return results;
        });
    }
    // Remove a student from a classroom
    removeStudent(classroomId, studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Removing student ${studentId} from classroom ${classroomId}`);
            const result = yield classroomModel_1.Classroom.updateOne({ _id: classroomId }, { $pull: { students: studentId } });
            if (result.modifiedCount === 0) {
                throw new Error('Failed to remove student from classroom');
            }
            logger_1.default.info('Student removed successfully');
            return true;
        });
    }
}
exports.default = ClassroomService;
