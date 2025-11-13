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
  }
});

RoomSchema.methods.checkAvailability = function(date) {
  return this.isAvailable;
};

RoomSchema.methods.customValidate = function() {
  return true;
};

module.exports = mongoose.model('Room', RoomSchema);