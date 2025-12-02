const RoomRepository = require('../repository/roomRepository');

const roomRepository = new RoomRepository();

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await roomRepository.getAllRooms();
    res.status(200).json({
      success: true,
      data: rooms,
      count: rooms.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await roomRepository.getRoomById(roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

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
    const checkDate = new Date(date);
    if (isNaN(checkDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Format tanggal tidak valid' });
    }

    const isAvailable = await roomRepository.checkRoomAvailability(roomId, checkDate);
    
    res.status(200).json({
      success: true,
      roomId: roomId,
      date: date,
      isAvailable
    });

  } catch (error) {
    if (error.message === 'Room not found') {
      return res.status(404).json({ success: false, error: 'Room tidak ditemukan' });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await roomRepository.updateRoom(req.params.roomId, req.body);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room tidak ditemukan untuk diupdate'
      });
    }

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