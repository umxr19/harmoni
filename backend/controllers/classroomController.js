const Classroom = require('../models/Classroom');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendEmail } = require('../utils/emailService');
const Activity = require('../models/Activity');

// Get all classrooms for a teacher
exports.getTeacherClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.aggregate([
      { $match: { teacherId: mongoose.Types.ObjectId(req.user.id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'students',
          foreignField: '_id',
          as: 'studentDetails'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          gradeLevel: 1,
          subject: 1,
          createdAt: 1,
          teacherId: 1,
          studentCount: { $size: '$studentDetails' }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json(classrooms);
  } catch (error) {
    console.error('Error fetching teacher classrooms:', error);
    res.status(500).json({ message: 'Failed to fetch classrooms' });
  }
};

// Get a single classroom by ID
exports.getClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('students', 'name email')
      .populate('teacherId', 'name email');

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Check if user is authorized to view this classroom
    if (
      classroom.teacherId._id.toString() !== req.user.id &&
      !classroom.students.some(student => student._id.toString() === req.user.id)
    ) {
      return res.status(403).json({ message: 'Not authorized to view this classroom' });
    }

    res.status(200).json(classroom);
  } catch (error) {
    console.error('Error fetching classroom:', error);
    res.status(500).json({ message: 'Failed to fetch classroom' });
  }
};

// Create a new classroom
exports.createClassroom = async (req, res) => {
  try {
    const { name, description, gradeLevel, subject } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Classroom name is required' });
    }

    const newClassroom = new Classroom({
      name,
      description,
      gradeLevel,
      subject,
      teacherId: req.user.id,
      students: [],
      createdAt: new Date()
    });

    await newClassroom.save();

    res.status(201).json(newClassroom);
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({ message: 'Failed to create classroom' });
  }
};

// Update a classroom
exports.updateClassroom = async (req, res) => {
  try {
    const { name, description, gradeLevel, subject } = req.body;
    const classroomId = req.params.id;

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Check if user is the teacher of this classroom
    if (classroom.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this classroom' });
    }

    const updatedClassroom = await Classroom.findByIdAndUpdate(
      classroomId,
      {
        name: name || classroom.name,
        description: description !== undefined ? description : classroom.description,
        gradeLevel: gradeLevel || classroom.gradeLevel,
        subject: subject || classroom.subject
      },
      { new: true }
    );

    res.status(200).json(updatedClassroom);
  } catch (error) {
    console.error('Error updating classroom:', error);
    res.status(500).json({ message: 'Failed to update classroom' });
  }
};

// Delete a classroom
exports.deleteClassroom = async (req, res) => {
  try {
    const classroomId = req.params.id;
    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Check if user is the teacher of this classroom
    if (classroom.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this classroom' });
    }

    await Classroom.findByIdAndDelete(classroomId);

    res.status(200).json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    res.status(500).json({ message: 'Failed to delete classroom' });
  }
};

// Get students in a classroom
exports.getClassroomStudents = async (req, res) => {
  try {
    const classroomId = req.params.id;
    const classroom = await Classroom.findById(classroomId)
      .populate('students', 'name email');

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Check if user is authorized to view this classroom
    if (classroom.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this classroom' });
    }

    res.status(200).json(classroom.students);
  } catch (error) {
    console.error('Error fetching classroom students:', error);
    res.status(500).json({ message: 'Failed to fetch classroom students' });
  }
};

// Invite students to a classroom
exports.inviteStudents = async (req, res) => {
  try {
    const classroomId = req.params.id;
    const { emails, message } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'At least one email address is required' });
    }

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Check if user is the teacher of this classroom
    if (classroom.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to invite students to this classroom' });
    }

    const teacher = await User.findById(req.user.id);

    // Generate invitation tokens and send emails
    const invitationResults = await Promise.all(
      emails.map(async (email) => {
        try {
          // Check if user already exists
          const existingUser = await User.findOne({ email });
          
          if (existingUser) {
            // If user exists, check if already in classroom
            if (classroom.students.includes(existingUser._id)) {
              return { email, status: 'already-member' };
            }
            
            // Add user to classroom
            classroom.students.push(existingUser._id);
            
            // Send notification email
            await sendEmail({
              to: email,
              subject: `You've been added to ${classroom.name}`,
              text: `${teacher.name} has added you to their classroom: ${classroom.name}. ${message ? `\n\nMessage from teacher: ${message}` : ''}`,
              html: `
                <h1>You've been added to a classroom</h1>
                <p>${teacher.name} has added you to their classroom: <strong>${classroom.name}</strong>.</p>
                ${message ? `<p>Message from teacher: ${message}</p>` : ''}
                <p>Log in to your account to access the classroom.</p>
              `
            });
            
            return { email, status: 'added' };
          } else {
            // Generate invitation token
            const token = generateInvitationToken();
            
            // Store invitation in database
            await saveInvitation({
              email,
              classroomId,
              token,
              teacherId: req.user.id
            });
            
            // Send invitation email
            await sendEmail({
              to: email,
              subject: `Invitation to join ${classroom.name}`,
              text: `${teacher.name} has invited you to join their classroom: ${classroom.name}. ${message ? `\n\nMessage from teacher: ${message}` : ''}\n\nClick the link to accept: ${process.env.FRONTEND_URL}/invite/accept/${token}`,
              html: `
                <h1>Classroom Invitation</h1>
                <p>${teacher.name} has invited you to join their classroom: <strong>${classroom.name}</strong>.</p>
                ${message ? `<p>Message from teacher: ${message}</p>` : ''}
                <p><a href="${process.env.FRONTEND_URL}/invite/accept/${token}">Click here to accept the invitation</a></p>
              `
            });
            
            return { email, status: 'invited' };
          }
        } catch (err) {
          console.error(`Error inviting ${email}:`, err);
          return { email, status: 'error', message: err.message };
        }
      })
    );

    // Save the classroom with any added students
    await classroom.save();

    res.status(200).json({
      message: 'Invitations processed',
      results: invitationResults
    });
  } catch (error) {
    console.error('Error inviting students:', error);
    res.status(500).json({ message: 'Failed to process invitations' });
  }
};

// Remove a student from a classroom
exports.removeStudent = async (req, res) => {
  try {
    const { id: classroomId, studentId } = req.params;

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Check if user is the teacher of this classroom
    if (classroom.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to remove students from this classroom' });
    }

    // Check if student is in the classroom
    if (!classroom.students.includes(studentId)) {
      return res.status(404).json({ message: 'Student not found in this classroom' });
    }

    // Remove student from classroom
    classroom.students = classroom.students.filter(
      student => student.toString() !== studentId
    );

    await classroom.save();

    res.status(200).json({ message: 'Student removed from classroom' });
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({ message: 'Failed to remove student' });
  }
};

// Helper functions
function generateInvitationToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

async function saveInvitation(invitationData) {
  const Invitation = require('../models/Invitation');
  const invitation = new Invitation({
    ...invitationData,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiration
  });
  await invitation.save();
  return invitation;
}

// Get all classrooms for a student
exports.getStudentClassrooms = async (req, res) => {
  try {
    const studentId = req.user.id;
    console.log(`Getting classrooms for student ID: ${studentId}`);
    
    // Find classrooms where the user is a student
    // The query was incorrect - students is an array of ObjectIds, not objects with studentId
    const classrooms = await Classroom.find({ students: studentId })
      .populate('teacherId', 'name email');
    
    console.log(`Found ${classrooms.length} classrooms for student`);
    
    // Format classrooms for the frontend
    const formattedClassrooms = classrooms.map(classroom => {
      return {
        _id: classroom._id,
        name: classroom.name,
        description: classroom.description,
        teacherId: classroom.teacherId._id,
        teacherName: classroom.teacherId.name
      };
    });
    
    res.json(formattedClassrooms);
  } catch (error) {
    console.error('Error getting student classrooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a student to a classroom
exports.addStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const classroomId = req.params.id;
    
    // Find the classroom
    const classroom = await Classroom.findById(classroomId);
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    // Check if the user is the teacher of the classroom
    if (classroom.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add students to this classroom' });
    }
    
    // Check if the student exists
    const student = await User.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if the student is already in the classroom
    if (classroom.students.some(s => s.studentId.toString() === studentId)) {
      return res.status(400).json({ message: 'Student is already in this classroom' });
    }
    
    // Add the student to the classroom
    classroom.students.push({
      studentId,
      joinedAt: Date.now()
    });
    
    await classroom.save();
    
    // Log activity for both teacher and student
    const teacherActivity = new Activity({
      userId: req.user.id,
      type: 'classroom',
      itemId: classroom._id.toString(),
      result: {
        timeSpent: 0
      },
      metadata: {
        title: `Added student to classroom: ${classroom.name}`,
        category: 'Classroom Management'
      }
    });
    
    const studentActivity = new Activity({
      userId: studentId,
      type: 'classroom',
      itemId: classroom._id.toString(),
      result: {
        timeSpent: 0
      },
      metadata: {
        title: `Joined classroom: ${classroom.name}`,
        category: 'Classroom Enrollment'
      }
    });
    
    await Promise.all([teacherActivity.save(), studentActivity.save()]);
    
    res.json({ message: 'Student added to classroom' });
  } catch (error) {
    console.error('Error adding student to classroom:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 