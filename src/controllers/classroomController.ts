import { Request, Response } from 'express';
import { Classroom } from '../models/classroomModel';
import { User } from '../models/userModel';

export const createClassroom = async (req: Request, res: Response) => {
    try {
        const classroom = new Classroom({
            ...req.body,
            teacherId: req.user!.id
        });
        await classroom.save();
        res.status(201).json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Error creating classroom' });
    }
};

export const getClassrooms = async (req: Request, res: Response) => {
    try {
        const classrooms = await Classroom.find({ teacherId: req.user!.id })
            .populate('students', 'username email')
            .sort({ createdAt: -1 });
        res.json(classrooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching classrooms' });
    }
};

export const getClassroomById = async (req: Request, res: Response) => {
    try {
        const classroom = await Classroom.findOne({
            _id: req.params.id,
            teacherId: req.user!.id
        }).populate('students', 'username email');

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        res.json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching classroom' });
    }
};

export const updateClassroom = async (req: Request, res: Response) => {
    try {
        const classroom = await Classroom.findOneAndUpdate(
            { _id: req.params.id, teacherId: req.user!.id },
            req.body,
            { new: true }
        );

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        res.json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Error updating classroom' });
    }
};

export const deleteClassroom = async (req: Request, res: Response) => {
    try {
        const classroom = await Classroom.findOneAndDelete({
            _id: req.params.id,
            teacherId: req.user!.id
        });

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Remove classroom from students' classrooms
        await User.updateMany(
            { 'classrooms.classroomId': req.params.id },
            { $pull: { classrooms: { classroomId: req.params.id } } }
        );

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting classroom' });
    }
};

export const addStudent = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.body;
        const classroom = await Classroom.findOne({
            _id: req.params.id,
            teacherId: req.user!.id
        });

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        const student = await User.findOne({ _id: studentId, role: 'student' });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Add student to classroom
        if (!classroom.students.includes(studentId)) {
            classroom.students.push(studentId);
            await classroom.save();
        }

        // Add classroom to student's classrooms
        await User.findByIdAndUpdate(studentId, {
            $addToSet: {
                classrooms: {
                    classroomId: classroom._id,
                    teacherId: req.user!.id
                }
            }
        });

        res.json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Error adding student to classroom' });
    }
};

export const removeStudent = async (req: Request, res: Response) => {
    try {
        const classroom = await Classroom.findOne({
            _id: req.params.id,
            teacherId: req.user!.id
        });

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Remove student from classroom
        classroom.students = classroom.students.filter(
            (id: any) => id.toString() !== req.params.studentId
        );
        await classroom.save();

        // Remove classroom from student's classrooms
        await User.findByIdAndUpdate(req.params.studentId, {
            $pull: { classrooms: { classroomId: req.params.id } }
        });

        res.json({ message: 'Student removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing student from classroom' });
    }
};

export const getStudentClassrooms = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user!.id)
            .populate({
                path: 'classrooms.classroomId',
                select: 'name description teacherId'
            })
            .populate('classrooms.teacherId', 'username');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add null check for classrooms
        if (!user.classrooms || user.classrooms.length === 0) {
            return res.json([]);
        }
        
        const classrooms = user.classrooms.map((c: any) => ({
            ...c.classroomId.toObject(),
            teacherName: c.teacherId?.username || 'Unknown Teacher'
        }));

        res.json(classrooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student classrooms' });
    }
}; 