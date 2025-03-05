const Assignment = require('../models/Assignment');
const Classroom = require('../models/Classroom');
const User = require('../models/User');
const Activity = require('../models/Activity');

// Get all assignments for a teacher
exports.getTeacherAssignments = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    // Find classrooms where the user is a teacher
    const classrooms = await Classroom.find({ teacherId });
    const classroomIds = classrooms.map(classroom => classroom._id);
    
    // Find assignments for those classrooms
    const assignments = await Assignment.find({ classroomId: { $in: classroomIds } });
    
    res.json(assignments);
  } catch (error) {
    console.error('Error getting teacher assignments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all assignments for a student
exports.getStudentAssignments = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Find classrooms where the user is a student
    const classrooms = await Classroom.find({ 'students.studentId': studentId });
    const classroomIds = classrooms.map(classroom => classroom._id);
    
    // Find assignments for those classrooms
    const assignments = await Assignment.find({ classroomId: { $in: classroomIds } });
    
    // Format assignments with classroom names
    const formattedAssignments = assignments.map(assignment => {
      const classroom = classrooms.find(c => c._id.toString() === assignment.classroomId.toString());
      return {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        classroomId: assignment.classroomId,
        classroomName: classroom ? classroom.name : 'Unknown Classroom',
        completed: assignment.submissions.some(sub => sub.studentId.toString() === studentId)
      };
    });
    
    res.json(formattedAssignments);
  } catch (error) {
    console.error('Error getting student assignments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single assignment
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (error) {
    console.error('Error getting assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, classroomId } = req.body;
    
    // Check if the classroom exists
    const classroom = await Classroom.findById(classroomId);
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    // Check if the user is the teacher of the classroom
    if (classroom.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create assignments for this classroom' });
    }
    
    // Create the assignment
    const assignment = new Assignment({
      title,
      description,
      dueDate,
      classroomId,
      submissions: []
    });
    
    await assignment.save();
    
    // Log activity
    const activity = new Activity({
      userId: req.user.id,
      type: 'assignment',
      itemId: assignment._id.toString(),
      result: {
        timeSpent: 0
      },
      metadata: {
        title: `Created assignment: ${title}`,
        category: 'Assignment Creation'
      }
    });
    
    await activity.save();
    
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    
    // Find the assignment
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if the user is the teacher of the classroom
    const classroom = await Classroom.findById(assignment.classroomId);
    
    if (!classroom || classroom.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }
    
    // Update the assignment
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate || assignment.dueDate;
    
    await assignment.save();
    
    res.json(assignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an assignment
exports.deleteAssignment = async (req, res) => {
  try {
    // Find the assignment
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if the user is the teacher of the classroom
    const classroom = await Classroom.findById(assignment.classroomId);
    
    if (!classroom || classroom.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }
    
    await assignment.remove();
    
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit an assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { content } = req.body;
    const studentId = req.user.id;
    
    // Find the assignment
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if the student is in the classroom
    const classroom = await Classroom.findById(assignment.classroomId);
    
    if (!classroom || !classroom.students.some(student => student.studentId.toString() === studentId)) {
      return res.status(403).json({ message: 'Not authorized to submit to this assignment' });
    }
    
    // Check if the student has already submitted
    const existingSubmissionIndex = assignment.submissions.findIndex(
      sub => sub.studentId.toString() === studentId
    );
    
    if (existingSubmissionIndex !== -1) {
      // Update existing submission
      assignment.submissions[existingSubmissionIndex].content = content;
      assignment.submissions[existingSubmissionIndex].submittedAt = Date.now();
    } else {
      // Add new submission
      assignment.submissions.push({
        studentId,
        content,
        submittedAt: Date.now(),
        grade: null,
        feedback: ''
      });
    }
    
    await assignment.save();
    
    // Log activity
    const activity = new Activity({
      userId: studentId,
      type: 'assignment',
      itemId: assignment._id.toString(),
      result: {
        timeSpent: 0
      },
      metadata: {
        title: `Submitted assignment: ${assignment.title}`,
        category: 'Assignment Submission'
      }
    });
    
    await activity.save();
    
    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Grade an assignment submission
exports.gradeAssignment = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const { id, studentId } = req.params;
    
    // Find the assignment
    const assignment = await Assignment.findById(id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check if the user is the teacher of the classroom
    const classroom = await Classroom.findById(assignment.classroomId);
    
    if (!classroom || classroom.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to grade this assignment' });
    }
    
    // Find the submission
    const submissionIndex = assignment.submissions.findIndex(
      sub => sub.studentId.toString() === studentId
    );
    
    if (submissionIndex === -1) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Update the submission
    assignment.submissions[submissionIndex].grade = grade;
    assignment.submissions[submissionIndex].feedback = feedback;
    assignment.submissions[submissionIndex].gradedAt = Date.now();
    
    await assignment.save();
    
    // Log activity for the student
    const activity = new Activity({
      userId: studentId,
      type: 'assignment',
      itemId: assignment._id.toString(),
      result: {
        score: grade,
        isCorrect: grade >= 70, // Assuming 70% is passing
        timeSpent: 0
      },
      metadata: {
        title: `Received grade for: ${assignment.title}`,
        category: 'Assignment Grading'
      }
    });
    
    await activity.save();
    
    res.json({ message: 'Assignment graded successfully' });
  } catch (error) {
    console.error('Error grading assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 