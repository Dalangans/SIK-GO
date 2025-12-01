const Room = require('../database/models/Room');

class RoomRepository {
  async createRoom(roomData) {
    try {
      return await Room.create(roomData);
    } catch (error) {
      throw error;
    }
  }

  async getRoomById(roomId) {
    try {
      // Try to find by _id first (MongoDB ObjectId)
      let room = await Room.findById(roomId);
      if (room) return room;
      
      // Fallback to roomId (numeric field)
      return await Room.findOne({ roomId });
    } catch (error) {
      throw error;
    }
  }

  async getAllRooms() {
    try {
      return await Room.find();
    } catch (error) {
      throw error;
    }
  }

  async checkRoomAvailability(roomId, date) {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) {
        throw new Error('Room not found');
      }
      return room.checkAvailability(date);
    } catch (error) {
      throw error;
    }
  }

  async updateRoom(roomId, updateData) {
    try {
      return await Room.findOneAndUpdate({ roomId }, updateData, {
        new: true,            
        runValidators: true  
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteRoom(roomId) {
    try {
      return await Room.findByIdAndDelete(roomId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RoomRepository;