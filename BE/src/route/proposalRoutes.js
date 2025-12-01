const express = require('express');
const {
  createProposal,
  getAllProposals,
  getMyProposals,
  getProposalById,
  updateProposal,
  submitProposal,
  generateAIReview,
  manualReview,
  deleteProposal,
  getProposalsNeedingReview
} = require('../controller/proposalController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/proposals/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword', 'text/plain'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Public routes (none for proposals)

// Protected routes
router.post('/', protect, upload.single('file'), createProposal);
router.get('/my-proposals', protect, getMyProposals);
router.get('/:id', protect, getProposalById);
router.put('/:id', protect, upload.single('file'), updateProposal);
router.delete('/:id', protect, deleteProposal);
router.put('/:id/submit', protect, submitProposal);
router.post('/:id/ai-review', protect, generateAIReview);
router.post('/:id/manual-review', protect, manualReview);

// Admin routes
router.get('/', protect, getAllProposals);
router.get('/review/pending', protect, getProposalsNeedingReview);

module.exports = router;
