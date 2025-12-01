const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  // Primary identifiers
  gedung: {
    type: String,
    required: true,
    index: true,
    enum: ['K', 'Area Lain', 'GK', 'S'],
    description: 'Building code'
  },
  ruang: {
    type: String,
    required: true,
    index: true,
    description: 'Room identifier/name'
  },
  
  // Room details
  kapasitas: {
    type: Number,
    required: true,
    min: 1,
    description: 'Room capacity in seats'
  },
  deskripsi: {
    type: String,
    default: '',
    description: 'Room description and facilities'
  },
  lokasi: {
    type: String,
    default: '',
    description: 'Room location/address'
  },
  fasilitas: {
    type: [String],
    default: [],
    description: 'Available facilities (projector, whiteboard, etc)'
  },
  
  // Status and availability
  status: {
    type: String,
    enum: ['tersedia', 'tidak tersedia', 'maintenance'],
    default: 'tersedia',
    description: 'Current room status'
  },
  
  // Legacy fields for compatibility
  roomId: {
    type: Number,
    default: null,
    sparse: true
  },
  roomName: {
    type: String,
    default: null
  },
  capacity: {
    type: Number,
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  facilities: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'rooms'
});

// Ensure unique combination of gedung and ruang
RoomSchema.index({ gedung: 1, ruang: 1 }, { unique: true, sparse: true });

RoomSchema.methods.checkAvailability = function(date) {
  return this.isAvailable !== false && this.status === 'tersedia';
};

RoomSchema.methods.customValidate = function() {
  return true;
};

module.exports = mongoose.model('Room', RoomSchema);