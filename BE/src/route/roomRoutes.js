const express = require('express');
const router = express.Router();
const roomController = require('../controller/roomController');
const { protect, authorize } = require('../middleware/auth');

// ==================================================================
// 1. PUBLIC ROUTES (Bisa diakses tanpa login)
// ==================================================================
// Get all rooms - tidak perlu login
router.get('/', roomController.getAllRooms);

// Get single room by ID - tidak perlu login
router.get('/:roomId', roomController.getRoomById);


// ==================================================================
// 2. PROTECTED ROUTES (Harus Login / Punya Token)
// ==================================================================
// Middleware ini akan berlaku untuk semua route di bawah baris ini
router.use(protect); 

// Jika cek ketersediaan butuh login (seperti kode awalmu), biarkan di sini:
router
  .route('/:roomId/availability/:date')
  .get(roomController.getRoomAvailability);


// ==================================================================
// 3. ADMIN ROUTES (Hanya Admin)
// ==================================================================
router
  .route('/')
  .post(authorize('admin'), roomController.createRoom);

router
  .route('/:roomId')
  .put(authorize('admin'), roomController.updateRoom); 
  // Catatan: pertimbangkan pakai .patch() jika update-nya parsial (tidak semua field)

module.exports = router;