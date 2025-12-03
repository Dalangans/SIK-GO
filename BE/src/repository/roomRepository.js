const Room = require('../database/models/Room');

class RoomRepository {
  // Get available rooms for a specific date (no conflicting bookings)
  async getAvailableRoomsByDate(date) {
    const Booking = require('../database/models/Booking');
    const checkDate = new Date(date);
    // Find all bookings that overlap with the date
    const bookedRoomIds = await Booking.find({
      status: { $in: ['pending', 'approved', 'completed'] },
      startDate: { $lte: checkDate },
      endDate: { $gte: checkDate }
    }).distinct('room');
    // Return rooms that are not in the bookedRoomIds and are available
    return await Room.find({
      _id: { $nin: bookedRoomIds },
      isAvailable: true,
      status: 'tersedia'
    });
  }
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