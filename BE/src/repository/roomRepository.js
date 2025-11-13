const Room = require('../database/models/Room');

exports.createRoom = async (roomData) => {
  return await Room.create(roomData);
};

exports.getRoomById = async (roomId) => {
  return await Room.findOne({ roomId });
};

exports.checkRoomAvailability = async (roomId, date) => {
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new Error('Room not found');
  }
  return room.checkAvailability(date);
};

exports.updateRoom = async (roomId, updateData) => {
  return await Room.findOneAndUpdate({ roomId }, updateData, {
    new: true,            
    runValidators: true  
  });
};