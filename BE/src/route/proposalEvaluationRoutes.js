const express = require('express');
const {
  generateSummaryHandler,
  evaluateProposalHandler,
  upload,
} = require('../controller/proposalEvaluationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/proposals/summary
 * Generate summary of uploaded document
 * Body: multipart/form-data with 'file' field
 */
router.post('/summary', protect, upload.single('file'), generateSummaryHandler);

/**
 * POST /api/proposals/evaluate
 * Evaluate proposal according to FTUI standards
 * Body: multipart/form-data with 'file' field
 */
router.post('/evaluate', protect, upload.single('file'), evaluateProposalHandler);

module.exports = router;
