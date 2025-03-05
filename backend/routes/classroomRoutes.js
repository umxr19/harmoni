const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const auth = require('../middleware/auth');

// Get all classrooms for a teacher
router.get('/teacher', auth, classroomController.getTeacherClassrooms);

// Get all classrooms for a student
router.get('/student', auth, classroomController.getStudentClassrooms);

// Get a single classroom
router.get('/:id', auth, classroomController.getClassroom);

// Create a new classroom
router.post('/', auth, classroomController.createClassroom);

// Update a classroom
router.put('/:id', auth, classroomController.updateClassroom);

// Delete a classroom
router.delete('/:id', auth, classroomController.deleteClassroom);

// Add a student to a classroom
router.post('/:id/students', auth, classroomController.addStudent);

// Remove a student from a classroom
router.delete('/:id/students/:studentId', auth, classroomController.removeStudent);

module.exports = router; 