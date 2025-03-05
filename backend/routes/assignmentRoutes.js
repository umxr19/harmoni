const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const auth = require('../middleware/auth');

// Get all assignments for a teacher
router.get('/teacher', auth, assignmentController.getTeacherAssignments);

// Get all assignments for a student
router.get('/student', auth, assignmentController.getStudentAssignments);

// Get a single assignment
router.get('/:id', auth, assignmentController.getAssignment);

// Create a new assignment
router.post('/', auth, assignmentController.createAssignment);

// Update an assignment
router.put('/:id', auth, assignmentController.updateAssignment);

// Delete an assignment
router.delete('/:id', auth, assignmentController.deleteAssignment);

// Submit an assignment
router.post('/:id/submit', auth, assignmentController.submitAssignment);

// Grade an assignment submission
router.post('/:id/grade/:studentId', auth, assignmentController.gradeAssignment);

module.exports = router; 