const mongoose = require('mongoose');

const SIK_DocumentSchema = new mongoose.Schema({
  // Siapa yang upload (relasi ke User)
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  // Nama asli file
  fileName: {
    type: String,
    required: true
  },
  // Lokasi penyimpanan file di server (penting!)
  filePath: {
    type: String,
    required: true
  },
  // Tipe file (pdf, docx, dll)
  mimeType: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SIK_Document', SIK_DocumentSchema);