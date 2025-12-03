const express = require('express');
const proposalController = require('../controller/proposalController');
const { protect } = require('../middleware/auth');
const fs = require('fs');

const router = express.Router();
const { upload } = proposalController;

// Create upload directory if not exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ===== Routes TANPA parameter ID =====
router.post('/', protect, upload.single('file'), proposalController.createProposal);
router.get('/', protect, proposalController.getAllProposals);
router.get('/my-proposals', protect, proposalController.getMyProposals);
router.get('/review/pending', protect, proposalController.getProposalsNeedingReview);

// Analysis & Evaluation routes
router.post('/summary', protect, upload.single('file'), proposalController.generateSummaryHandler);
router.post('/evaluate', protect, upload.single('file'), proposalController.evaluateProposalHandler);
router.post('/analyze', protect, upload.single('file'), proposalController.analyzeProposal);
router.post('/check-plagiarism', protect, upload.single('file'), proposalController.checkProposalPlagiarism);
router.post('/suggestions', protect, upload.single('file'), proposalController.getImprovementSuggestions);
router.post('/audit', protect, upload.single('file'), proposalController.auditProposal);

// ===== Routes DENGAN parameter ID =====
router.get('/:id', protect, proposalController.getProposalById);
router.put('/:id', protect, upload.single('file'), proposalController.updateProposal);
router.delete('/:id', protect, proposalController.deleteProposal);
router.put('/:id/submit', protect, proposalController.submitProposal);
router.post('/:id/ai-review', protect, proposalController.generateAIReview);
router.post('/:id/manual-review', protect, proposalController.manualReview);

module.exports = router;