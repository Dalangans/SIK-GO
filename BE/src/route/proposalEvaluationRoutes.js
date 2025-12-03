const express = require('express');
const {
  generateSummaryHandler,
  evaluateProposalHandler,
  upload,
} = require('../controller/proposalEvaluationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/summary', protect, upload.single('file'), generateSummaryHandler);
router.post('/evaluate', protect, upload.single('file'), evaluateProposalHandler);

module.exports = router;
