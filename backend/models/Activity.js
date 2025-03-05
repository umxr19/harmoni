const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['question', 'practice', 'exam', 'assignment', 'classroom'],
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  result: {
    score: Number,
    isCorrect: Boolean,
    timeSpent: Number, // in seconds
    answers: Array
  },
  metadata: {
    category: String,
    categories: [String],
    title: String,
    difficulty: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for faster queries
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ userId: 1, type: 1 });
ActivitySchema.index({ userId: 1, 'metadata.category': 1 });

module.exports = mongoose.model('Activity', ActivitySchema); 