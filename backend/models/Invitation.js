const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  accepted: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries and expiration
invitationSchema.index({ token: 1 }, { unique: true });
invitationSchema.index({ email: 1, classroomId: 1 }, { unique: true });
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic deletion

module.exports = mongoose.model('Invitation', invitationSchema); 