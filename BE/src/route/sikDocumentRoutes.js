const express = require('express');
const router = express.Router();
const sikDocumentController = require('../controller/sikDocumentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .post(authorize('student'), sikDocumentController.createSIKDocument);

router
  .route('/:docId/status')
  .put(authorize('admin'), sikDocumentController.updateDocumentStatus);

router
  .route('/:docId/generate')
  .get(sikDocumentController.generateDocument);

module.exports = router;