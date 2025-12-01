const express = require('express');
const {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBooking,
  approveBooking,
  rejectBooking,
  deleteBooking,
  checkAvailability,
  getBookingsByRoom,
  getPendingBookings,
  getAIRecommendations
} = require('../controller/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, updateBooking);
router.delete('/:id', protect, deleteBooking);
router.post('/check-availability', protect, checkAvailability);
router.post('/recommendations', protect, getAIRecommendations);
router.get('/room/:roomId', protect, getBookingsByRoom);

// Admin routes
router.get('/', protect, getAllBookings);
router.get('/status/pending', protect, getPendingBookings);
router.put('/:id/approve', protect, approveBooking);
router.put('/:id/reject', protect, rejectBooking);

module.exports = router;
