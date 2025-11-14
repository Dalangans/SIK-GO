const express = require('express');
const router = express.Router();
const roomController = require('../controller/roomController');
const { protect, authorize } = require('../middleware/auth');


router.use(protect); 

router
  .route('/:roomId/availability/:date')
  .get(roomController.getRoomAvailability);

router
  .route('/')
  .post(authorize('admin'), roomController.createRoom);

router
  .route('/:roomId')
  .put(authorize('admin'), roomController.updateRoom); 

module.exports = router;