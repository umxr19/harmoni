// This is a mock controller for testing purposes
exports.getTeacherClassrooms = (req, res) => {
  // Mock data for classrooms
  const classrooms = [
    {
      _id: '1',
      name: 'Math 101',
      description: 'Introduction to Mathematics',
      gradeLevel: 'high',
      subject: 'Mathematics',
      teacherId: req.user.id,
      studentCount: 15,
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Science Class',
      description: 'Basic Science Concepts',
      gradeLevel: 'middle',
      subject: 'Science',
      teacherId: req.user.id,
      studentCount: 12,
      createdAt: new Date().toISOString()
    },
    {
      _id: '3',
      name: 'History 202',
      description: 'World History',
      gradeLevel: 'high',
      subject: 'History',
      teacherId: req.user.id,
      studentCount: 18,
      createdAt: new Date().toISOString()
    }
  ];

  res.status(200).json(classrooms);
};

exports.getClassroom = (req, res) => {
  // Mock data for a single classroom
  const classroom = {
    _id: req.params.id,
    name: 'Math 101',
    description: 'Introduction to Mathematics',
    gradeLevel: 'high',
    subject: 'Mathematics',
    teacherId: {
      _id: req.user.id,
      name: 'John Doe',
      email: 'john@example.com'
    },
    students: [
      {
        _id: '101',
        name: 'Alice Smith',
        email: 'alice@example.com'
      },
      {
        _id: '102',
        name: 'Bob Johnson',
        email: 'bob@example.com'
      }
    ],
    createdAt: new Date().toISOString()
  };

  res.status(200).json(classroom);
};

exports.createClassroom = (req, res) => {
  // Mock creating a classroom
  const { name, description, gradeLevel, subject } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Classroom name is required' });
  }
  
  // Return a success response with mock data
  res.status(201).json({
    _id: Math.random().toString(36).substring(7),
    name,
    description,
    gradeLevel,
    subject,
    teacherId: req.user.id,
    students: [],
    createdAt: new Date().toISOString()
  });
};

exports.updateClassroom = (req, res) => {
  res.status(200).json({ message: 'Classroom updated successfully' });
};

exports.deleteClassroom = (req, res) => {
  res.status(200).json({ message: 'Classroom deleted successfully' });
};

exports.getClassroomStudents = (req, res) => {
  // Mock student data
  const students = [
    {
      _id: '101',
      name: 'Alice Smith',
      email: 'alice@example.com'
    },
    {
      _id: '102',
      name: 'Bob Johnson',
      email: 'bob@example.com'
    }
  ];
  
  res.status(200).json(students);
};

exports.inviteStudents = (req, res) => {
  const { emails, message } = req.body;
  
  // Mock invitation results
  const invitationResults = emails.map(email => ({
    email,
    status: 'invited'
  }));
  
  res.status(200).json({
    message: 'Invitations processed',
    results: invitationResults
  });
};

exports.removeStudent = (req, res) => {
  res.status(200).json({ message: 'Student removed from classroom' });
}; 