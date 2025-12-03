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
  // File binary disimpan langsung ke database (BUKAN lokasi path)
  fileData: {
    type: Buffer,
    required: true
  },
  // Tipe file (pdf, docx, dll)
  mimeType: {
    type: String,
    required: true
  },
  // Ukuran file dalam bytes
  fileSize: {
    type: Number
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