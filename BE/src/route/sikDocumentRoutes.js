const express = require('express');
const router = express.Router();
const sikDocumentController = require('../controller/sikDocumentController');
const { protect, authorize } = require('../middleware/auth');

// 1. Setup Multer (Untuk menangani upload file)
const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Pastikan folder 'uploads' ada di root project kamu nanti
  },
  filename: function (req, file, cb) {
    // Namai file: file-userid-timestamp.extensi
    cb(null, 'file-' + Date.now() + path.extname(file.originalname));
  }
});

// Filter agar hanya menerima PDF (Opsional, bisa dihapus kalau mau semua file)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Hanya file PDF yang diperbolehkan!'), false);
    }
};

const upload = multer({ storage: storage }); 
// Kalau mau pakai filter, ganti jadi: const upload = multer({ storage: storage, fileFilter: fileFilter });

// 2. Routes
router.use(protect); // Semua route di bawah butuh login

router
  .route('/')
  // Tambahkan 'upload.single("file")' di tengah
  // "file" adalah nama key yang harus dikirim dari Frontend/Postman
  .post(authorize('student'), upload.single('file'), sikDocumentController.createSIKDocument);

router
  .route('/:docId/status')
  .put(authorize('admin'), sikDocumentController.updateDocumentStatus);

module.exports = router;