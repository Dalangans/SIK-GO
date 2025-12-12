const BookingRepository = require('../repository/bookingRepository');
const RoomRepository = require('../repository/roomRepository');
const { generateBookingRecommendations } = require('../util/geminiService');
const { successResponse, errorResponse } = require('../util/response');
const logger = require('../util/logger');

const bookingRepo = new BookingRepository();
const roomRepo = new RoomRepository();

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { roomId, startDate, endDate, startTime, endTime, purpose, description, participantCount, proposalId, kelas } = req.body;
    const userId = req.user._id || req.user.id;

    logger.booking('CREATE BOOKING REQUEST', {
      userId,
      roomId,
      startDate,
      endDate,
      startTime,
      endTime,
      purpose,
      participantCount,
      kelas
    });

    // Validate required fields
    if (!roomId || !startDate || !endDate || !startTime || !endTime || !purpose || !participantCount) {
      logger.warn('Missing required fields in booking request', {
        roomId: !!roomId,
        startDate: !!startDate,
        endDate: !!endDate,
        startTime: !!startTime,
        endTime: !!endTime,
        purpose: !!purpose,
        participantCount: !!participantCount
      });
      return errorResponse(res, 'Please provide all required fields', 400);
    }

    // Check if user has an approved proposal
    const Proposal = require('../database/models/Proposal');
    const approvedProposal = await Proposal.findOne({ user: userId, status: 'approved' });
    if (!approvedProposal) {
      logger.warn('User has no approved proposal', { userId });
      return errorResponse(res, 'You must have an approved proposal before booking a room', 403);
    }

    // Check room exists
    const room = await roomRepo.getRoomById(roomId);
    if (!room) {
      logger.error('Room not found', { roomId });
      return errorResponse(res, 'Room not found', 404);
    }

    logger.info('Room found', { roomId, roomName: room.ruang, capacity: room.kapasitas });

    // Check room availability
    const isAvailable = await bookingRepo.checkRoomAvailability(roomId, new Date(startDate), new Date(endDate));
    if (!isAvailable) {
      logger.warn('Room not available for selected dates', { roomId, startDate, endDate });
      return errorResponse(res, 'Room is not available for selected dates', 400);
    }

    const bookingData = {
      room: roomId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      purpose,
      description,
      participantCount: parseInt(participantCount),
      kelas,
      proposal: proposalId || approvedProposal._id // always link to approved proposal
    };

    logger.info('Creating booking with data', bookingData);

    const booking = await bookingRepo.createBooking(userId, bookingData);
    logger.booking('BOOKING CREATED SUCCESSFULLY', {
      bookingId: booking._id,
      userId,
      roomId,
      roomName: booking.room?.ruang,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status
    });
    
    // Booking already populated in repository
    successResponse(res, booking, 'Booking created successfully', 201);
  } catch (error) {
    logger.error('Error creating booking', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    errorResponse(res, error.message || 'Failed to create booking', 500);
  }
};

// @desc    Get all bookings (admin only)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { status, roomId } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (roomId) filter.room = roomId;

    const bookings = await bookingRepo.getAllBookings(filter);
    successResponse(res, bookings, 'Bookings retrieved successfully');
  } catch (error) {
    console.error('Error getting bookings:', error);
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get my bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const bookings = await bookingRepo.getBookingsByUser(userId);
    successResponse(res, bookings, 'Your bookings retrieved successfully');
  } catch (error) {
    console.error('Error getting bookings:', error);
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await bookingRepo.getBookingById(req.params.id);
    
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    // Check authorization
    const userId = (req.user._id || req.user.id).toString();
    if (booking.user._id.toString() !== userId && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to view this booking', 403);
    }

    successResponse(res, booking, 'Booking retrieved successfully');
  } catch (error) {
    console.error('Error getting booking:', error);
    errorResponse(res, error.message, 500);
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    let booking = await bookingRepo.getBookingById(req.params.id);

    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    // Check authorization
    const userId = (req.user._id || req.user.id).toString();
    if (booking.user._id.toString() !== userId && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to update this booking', 403);
    }

    // Don't allow update if already approved/rejected
    if (booking.status === 'approved' || booking.status === 'rejected') {
      return errorResponse(res, 'Cannot update already reviewed booking', 400);
    }

    // If dates changed, check availability
    if (req.body.startDate || req.body.endDate) {
      const newStartDate = req.body.startDate ? new Date(req.body.startDate) : booking.startDate;
      const newEndDate = req.body.endDate ? new Date(req.body.endDate) : booking.endDate;
      
      const isAvailable = await bookingRepo.checkRoomAvailability(booking.room, newStartDate, newEndDate);
      if (!isAvailable) {
        return errorResponse(res, 'Room is not available for selected dates', 400);
      }
    }

    const updateData = {
      startDate: req.body.startDate ? new Date(req.body.startDate) : booking.startDate,
      endDate: req.body.endDate ? new Date(req.body.endDate) : booking.endDate,
      startTime: req.body.startTime || booking.startTime,
      endTime: req.body.endTime || booking.endTime,
      purpose: req.body.purpose || booking.purpose,
      description: req.body.description || booking.description,
      participantCount: req.body.participantCount || booking.participantCount
    };

    booking = await bookingRepo.updateBooking(req.params.id, updateData);
    successResponse(res, booking, 'Booking updated successfully');
  } catch (error) {
    console.error('Error updating booking:', error);
    errorResponse(res, error.message, 500);
  }
};

// @desc    Approve booking
// @route   PUT /api/bookings/:id/approve
// @access  Private/Admin
exports.approveBooking = async (req, res) => {
  try {
    const { notes } = req.body;
    const approverId = req.user._id || req.user.id;

    let booking = await bookingRepo.getBookingById(req.params.id);

    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    if (booking.status !== 'pending') {
      return errorResponse(res, 'Only pending bookings can be approved', 400);
    }

    booking = await bookingRepo.approveBooking(req.params.id, approverId, notes || '');
    successResponse(res, booking, 'Booking approved successfully');
  } catch (error) {
    console.error('Error approving booking:', error);
    errorResponse(res, error.message, 500);
  }
};

// @desc    Reject booking
// @route   PUT /api/bookings/:id/reject
// @access  Private/Admin
exports.rejectBooking = async (req, res) => {
  try {
    const { notes } = req.body;
    const approverId = req.user._id || req.user.id;

    let booking = await bookingRepo.getBookingById(req.params.id);

    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    if (booking.status !== 'pending') {
      return errorResponse(res, 'Only pending bookings can be rejected', 400);
    }

    booking = await bookingRepo.rejectBooking(req.params.id, approverId, notes || '');
    successResponse(res, booking, 'Booking rejected successfully');
  } catch (error) {
    console.error('Error rejecting booking:', error);
    errorResponse(res, error.message, 500);
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await bookingRepo.getBookingById(req.params.id);

    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    const userId = (req.user._id || req.user.id).toString();
    if (booking.user._id.toString() !== userId && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized', 403);
    }

    if (booking.status === 'approved') {
      return errorResponse(res, 'Cannot delete approved booking', 400);
    }

    await bookingRepo.deleteBooking(req.params.id);
    successResponse(res, null, 'Booking deleted successfully');
  } catch (error) {
    console.error('Error deleting booking:', error);
    errorResponse(res, error.message, 500);
  }
};

// @desc    Check room availability
// @route   POST /api/bookings/check-availability
// @access  Private
exports.checkAvailability = async (req, res) => {
  try {
    const { roomId, startDate, endDate } = req.body;

    if (!roomId || !startDate || !endDate) {
      return errorResponse(res, 'Please provide roomId, startDate, and endDate', 400);
    }

    const isAvailable = await bookingRepo.checkRoomAvailability(roomId, new Date(startDate), new Date(endDate));
    successResponse(res, { available: isAvailable }, 'Availability check completed');
  } catch (error) {
    console.error('Error checking availability:', error);
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get bookings by room
// @route   GET /api/bookings/room/:roomId
// @access  Private
exports.getBookingsByRoom = async (req, res) => {
  try {
    const bookings = await bookingRepo.getBookingsByRoom(req.params.roomId);
    successResponse(res, bookings, 'Room bookings retrieved successfully');
  } catch (error) {
    console.error('Error getting room bookings:', error);
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get pending bookings (admin)
// @route   GET /api/bookings/status/pending
// @access  Private/Admin
exports.getPendingBookings = async (req, res) => {
  try {
    const bookings = await bookingRepo.getPendingBookings();
    successResponse(res, bookings, 'Pending bookings retrieved successfully');
  } catch (error) {
    console.error('Error getting pending bookings:', error);
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get AI recommendations
// @route   POST /api/bookings/recommendations
// @access  Private
exports.getAIRecommendations = async (req, res) => {
  try {
    const { roomId, startDate, endDate, startTime, endTime, purpose, personCount } = req.body;

    const room = await roomRepo.getRoomById(roomId);
    if (!room) {
      return errorResponse(res, 'Room not found', 404);
    }

    const recommendations = await generateBookingRecommendations(room.roomName, {
      date: startDate,
      time: startTime,
      duration: endTime,
      personCount,
      purpose
    });

    successResponse(res, recommendations, 'AI recommendations retrieved successfully');
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    errorResponse(res, error.message, 500);
  }
};
