const express = require('express');
const router = express.Router();
const proposalController = require('../controller/proposalController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .post(authorize('student'), proposalController.createProposal);

router
  .route('/:proposalId')
  .get(proposalController.getProposal)
  .put(authorize('student'), proposalController.updateProposal);

module.exports = router;