const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  category: {
    type: String,
    enum: ['academic', 'event', 'research', 'other'],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  content: {
    type: String,
    required: [true, 'Please add proposal content']
  },
  // File path jika ada
  filePath: {
    type: String
  },
  mimeType: {
    type: String
  },
  // AI Review
  aiReview: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    summary: String,
    reviewedAt: Date
  },
  // Manual review dari admin/reviewer
  manualReview: {
    reviewer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    comments: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedAt: Date
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewing', 'approved', 'rejected'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt sebelum save
ProposalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Proposal', ProposalSchema);
