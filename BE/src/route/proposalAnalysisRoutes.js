const express = require('express');
const { protect } = require('../middleware/auth');
const {
  upload,
  analyzeProposal,
  checkProposalPlagiarism,
  getImprovementSuggestions,
  auditProposal
} = require('../controller/proposalAnalysisController');

const router = express.Router();
router.post('/analyze', protect, upload.single('file'), analyzeProposal);
router.post('/check-plagiarism', protect, upload.single('file'), checkProposalPlagiarism);
router.post('/suggestions', protect, upload.single('file'), getImprovementSuggestions);
router.post('/audit', protect, upload.single('file'), auditProposal);

module.exports = router;
