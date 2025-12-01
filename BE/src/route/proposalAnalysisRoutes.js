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

/**
 * POST /api/proposals-analysis/analyze
 * Analyze proposal file quality and structure
 * Body: { title?: string, type?: string }
 * File: proposal document
 */
router.post('/analyze', protect, upload.single('file'), analyzeProposal);

/**
 * POST /api/proposals-analysis/check-plagiarism
 * Check proposal for plagiarism
 * File: proposal document
 */
router.post('/check-plagiarism', protect, upload.single('file'), checkProposalPlagiarism);

/**
 * POST /api/proposals-analysis/suggestions
 * Get improvement suggestions for proposal
 * Body: { type?: string }
 * File: proposal document
 */
router.post('/suggestions', protect, upload.single('file'), getImprovementSuggestions);

/**
 * POST /api/proposals-analysis/audit
 * Perform complete audit of proposal (includes analysis, plagiarism check, and suggestions)
 * Body: { title?: string, type?: string, author?: string }
 * File: proposal document
 */
router.post('/audit', protect, upload.single('file'), auditProposal);

module.exports = router;
