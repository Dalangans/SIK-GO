const express = require('express');
const { getUsers } = require('../controller/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// IMPORTANT: protect MUST come before authorize!
router.get('/', protect, authorize('admin'), getUsers);

module.exports = router;