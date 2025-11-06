const roomRepository = require('../repository/roomRepository');

exports.createRoom = async (req, res) => {
  try {
    const room = await roomRepository.createRoom(req.body);
    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getRoomAvailability = async (req, res) => {
  try {
    const { roomId, date } = req.params;
    const isAvailable = await roomRepository.checkRoomAvailability(roomId, new Date(date));
    res.status(200).json({
      success: true,
      isAvailable
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await roomRepository.updateRoom(req.params.roomId, req.body);
    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};