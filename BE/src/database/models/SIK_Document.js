const mongoose = require('mongoose');

const SIK_DocumentSchema = new mongoose.Schema({
  docId: {
    type: Number,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  proposalRef: {
    type: mongoose.Schema.ObjectId,
    ref: 'Proposal',
    required: true
  },
  generateDoc: function() {
    // Implement document generation logic
  }
});

module.exports = mongoose.model('SIK_Document', SIK_DocumentSchema);