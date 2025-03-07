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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentClassrooms = exports.removeStudent = exports.addStudent = exports.deleteClassroom = exports.updateClassroom = exports.getClassroomById = exports.getClassrooms = exports.createClassroom = void 0;
const classroomModel_1 = require("../models/classroomModel");
const userModel_1 = require("../models/userModel");
const createClassroom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const classroom = new classroomModel_1.Classroom(Object.assign(Object.assign({}, req.body), { teacherId: req.user.id }));
        yield classroom.save();
        res.status(201).json(classroom);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating classroom' });
    }
});
exports.createClassroom = createClassroom;
const getClassrooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const classrooms = yield classroomModel_1.Classroom.find({ teacherId: req.user.id })
            .populate('students', 'username email')
            .sort({ createdAt: -1 });
        res.json(classrooms);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching classrooms' });
    }
});
exports.getClassrooms = getClassrooms;
const getClassroomById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const classroom = yield classroomModel_1.Classroom.findOne({
            _id: req.params.id,
            teacherId: req.user.id
        }).populate('students', 'username email');
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        res.json(classroom);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching classroom' });
    }
});
exports.getClassroomById = getClassroomById;
const updateClassroom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const classroom = yield classroomModel_1.Classroom.findOneAndUpdate({ _id: req.params.id, teacherId: req.user.id }, req.body, { new: true });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        res.json(classroom);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating classroom' });
    }
});
exports.updateClassroom = updateClassroom;
const deleteClassroom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const classroom = yield classroomModel_1.Classroom.findOneAndDelete({
            _id: req.params.id,
            teacherId: req.user.id
        });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        // Remove classroom from students' classrooms
        yield userModel_1.User.updateMany({ 'classrooms.classroomId': req.params.id }, { $pull: { classrooms: { classroomId: req.params.id } } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting classroom' });
    }
});
exports.deleteClassroom = deleteClassroom;
const addStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId } = req.body;
        const classroom = yield classroomModel_1.Classroom.findOne({
            _id: req.params.id,
            teacherId: req.user.id
        });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        const student = yield userModel_1.User.findOne({ _id: studentId, role: 'student' });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        // Add student to classroom
        if (!classroom.students.includes(studentId)) {
            classroom.students.push(studentId);
            yield classroom.save();
        }
        // Add classroom to student's classrooms
        yield userModel_1.User.findByIdAndUpdate(studentId, {
            $addToSet: {
                classrooms: {
                    classroomId: classroom._id,
                    teacherId: req.user.id
                }
            }
        });
        res.json(classroom);
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding student to classroom' });
    }
});
exports.addStudent = addStudent;
const removeStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const classroom = yield classroomModel_1.Classroom.findOne({
            _id: req.params.id,
            teacherId: req.user.id
        });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        // Remove student from classroom
        classroom.students = classroom.students.filter((id) => id.toString() !== req.params.studentId);
        yield classroom.save();
        // Remove classroom from student's classrooms
        yield userModel_1.User.findByIdAndUpdate(req.params.studentId, {
            $pull: { classrooms: { classroomId: req.params.id } }
        });
        res.json({ message: 'Student removed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error removing student from classroom' });
    }
});
exports.removeStudent = removeStudent;
const getStudentClassrooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.User.findById(req.user.id)
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
        const classrooms = user.classrooms.map((c) => {
            var _a;
            return (Object.assign(Object.assign({}, c.classroomId.toObject()), { teacherName: ((_a = c.teacherId) === null || _a === void 0 ? void 0 : _a.username) || 'Unknown Teacher' }));
        });
        res.json(classrooms);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching student classrooms' });
    }
});
exports.getStudentClassrooms = getStudentClassrooms;
