const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room',
    required: true
  },
  // Proposal yang terkait dengan booking (optional)
  proposal: {
    type: mongoose.Schema.ObjectId,
    ref: 'Proposal'
  },
  startDate: {
    type: Date,
    required: [true, 'Please add start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add end date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add start time'] // format: HH:mm
  },
  endTime: {
    type: String,
    required: [true, 'Please add end time'] // format: HH:mm
  },
  purpose: {
    type: String,
    required: [true, 'Please add booking purpose']
  },
  description: String,
  participantCount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  approvalNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Validasi date
BookingSchema.pre('save', function(next) {
  if (this.endDate < this.startDate) {
    throw new Error('End date must be after start date');
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
