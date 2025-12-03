const express = require('express');
const {
  generateSummaryHandler,
  evaluateProposalHandler,
  generateSummaryByPathHandler,
  evaluateProposalByPathHandler,
  upload,
} = require('../controller/proposalEvaluationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/summary', protect, upload.single('file'), generateSummaryHandler);
router.post('/evaluate', protect, upload.single('file'), evaluateProposalHandler);
router.post('/summary-by-path', protect, generateSummaryByPathHandler);
router.post('/evaluate-by-path', protect, evaluateProposalByPathHandler);

module.exports = router;
