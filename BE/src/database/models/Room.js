const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: Number,
    required: true,
    unique: true
  },
  roomName: {
    type: String,
    required: true
  },
  description: String,
  capacity: {
    type: Number,
    default: 20
  },
  facilities: [String], // e.g., ['Projector', 'Whiteboard', 'AC']
  isAvailable: {
    type: Boolean,
    default: true
  },
  location: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

RoomSchema.methods.checkAvailability = function(date) {
  return this.isAvailable;
};

RoomSchema.methods.customValidate = function() {
  return true;
};

module.exports = mongoose.model('Room', RoomSchema);