const Booking = require('../database/models/Booking');
const logger = require('../util/logger');

class BookingRepository {
  // Create booking
  async createBooking(userId, bookingData) {
    try {
      const booking = new Booking({
        user: userId,
        ...bookingData
      });
      logger.info('[BookingRepo] Saving booking', { user: userId, ...bookingData });
      await booking.save();
      logger.info('[BookingRepo] Booking saved with ID', { bookingId: booking._id });
      
      // Populate references
      const populatedBooking = await Booking.findById(booking._id)
        .populate('user', 'email name')
        .populate('room')
        .populate('proposal', 'title');
      
      logger.info('[BookingRepo] Booking populated successfully', { bookingId: booking._id });
      return populatedBooking;
    } catch (error) {
      logger.error('[BookingRepo] Error creating booking', {
        message: error.message,
        stack: error.stack,
        userId,
        bookingData
      });
      throw error;
    }
  }

  // Get all bookings
  async getAllBookings(filter = {}) {
    try {
      return await Booking.find(filter)
        .populate('user', 'email name')
        .populate('room', 'roomName')
        .populate('proposal', 'title')
        .populate('approvedBy', 'email name')
        .sort({ startDate: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Get bookings by user
  async getBookingsByUser(userId) {
    try {
      return await Booking.find({ user: userId })
        .populate('room', 'roomName')
        .populate('proposal', 'title')
        .sort({ startDate: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Get single booking
  async getBookingById(bookingId) {
    try {
      return await Booking.findById(bookingId)
        .populate('user', 'email name')
        .populate('room')
        .populate('proposal')
        .populate('approvedBy', 'email name');
    } catch (error) {
      throw error;
    }
  }

  // Update booking
  async updateBooking(bookingId, updateData) {
    try {
      return await Booking.findByIdAndUpdate(bookingId, updateData, {
        new: true,
        runValidators: true
      }).populate('room');
    } catch (error) {
      throw error;
    }
  }

  // Delete booking
  async deleteBooking(bookingId) {
    try {
      return await Booking.findByIdAndDelete(bookingId);
    } catch (error) {
      throw error;
    }
  }

  // Get bookings by status
  async getBookingsByStatus(status) {
    try {
      return await Booking.find({ status })
        .populate('user', 'email name')
        .populate('room', 'roomName')
        .sort({ startDate: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Get bookings by room
  async getBookingsByRoom(roomId) {
    try {
      return await Booking.find({ room: roomId })
        .populate('user', 'email name')
        .sort({ startDate: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Check room availability
  async checkRoomAvailability(roomId, startDate, endDate) {
    try {
      const conflicting = await Booking.countDocuments({
        room: roomId,
        status: { $in: ['pending', 'approved', 'completed'] },
        $or: [
          { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
        ]
      });
      return conflicting === 0;
    } catch (error) {
      throw error;
    }
  }

  // Get pending bookings
  async getPendingBookings() {
    try {
      return await Booking.find({ status: 'pending' })
        .populate('user', 'email name')
        .populate('room', 'roomName')
        .sort({ createdAt: 1 });
    } catch (error) {
      throw error;
    }
  }

  // Approve booking
  async approveBooking(bookingId, approverId, notes = '') {
    try {
      return await Booking.findByIdAndUpdate(
        bookingId,
        {
          status: 'approved',
          approvedBy: approverId,
          approvalNotes: notes
        },
        { new: true, runValidators: true }
      ).populate('room');
    } catch (error) {
      throw error;
    }
  }

  // Reject booking
  async rejectBooking(bookingId, approverId, notes = '') {
    try {
      return await Booking.findByIdAndUpdate(
        bookingId,
        {
          status: 'rejected',
          approvedBy: approverId,
          approvalNotes: notes
        },
        { new: true, runValidators: true }
      ).populate('room');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BookingRepository;
