const express = require('express');
const router = express.Router();
const sikDocumentController = require('../controller/sikDocumentController');
const { protect, authorize } = require('../middleware/auth');

// 1. Setup Multer (Untuk menangani upload file ke memory buffer)
const multer = require('multer');

// Gunakan memory storage agar file langsung jadi buffer (disimpan di RAM sementara)
const storage = multer.memoryStorage();

// Filter agar hanya menerima PDF
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Hanya file PDF yang diperbolehkan!'), false);
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// 2. Routes
router.use(protect); // Semua route di bawah butuh login

// POST: Upload dokumen baru
router.post(
  '/',
  authorize('student'),
  upload.single('file'),
  sikDocumentController.createSIKDocument
);

// GET: Download dokumen by ID
router.get(
  '/:docId/download',
  sikDocumentController.downloadDocument
);

// GET: List semua dokumen (admin only)
router.get(
  '/admin/all',
  authorize('admin'),
  sikDocumentController.getAllDocuments
);

// GET: List dokumen milik user
router.get(
  '/user/my-documents',
  sikDocumentController.getUserDocuments
);

// PUT: Update status dokumen (admin only)
router.put(
  '/:docId/status',
  authorize('admin'),
  sikDocumentController.updateDocumentStatus
);

module.exports = router;