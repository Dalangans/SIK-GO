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
  isAvailable: {
    type: Boolean,
    default: true
  },
  checkAvailability: function(date) {
    // Implement room availability check logic
    return this.isAvailable;
  },
  validate: function() {
    // Implement room validation logic
    return true;
  }
});

module.exports = mongoose.model('Room', RoomSchema);