const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  gradeLevel: {
    type: String,
    enum: ['elementary', 'middle', 'high', 'college', 'professional', '']
  },
  subject: {
    type: String,
    trim: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
classroomSchema.index({ teacherId: 1 });
classroomSchema.index({ students: 1 });

module.exports = mongoose.model('Classroom', classroomSchema); 