const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  proposalId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  roomReq: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room',
    required: true
  },
  validate: function() {
    // Implement proposal validation logic
    return true;
  }
});

module.exports = mongoose.model('Proposal', ProposalSchema);